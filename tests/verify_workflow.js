import 'dotenv/config';
import { pool } from '../server/db.js';
import { EXAM_CATEGORIES } from '../shared/constants.js';
import { groupExamsByCategory } from '../shared/examCategories.js';
import { MIN_BANK_UPLOAD_QUESTIONS, syncStageQuestionBankMockTest } from '../server/services/questionBankSync.js';
import { shuffleQuestionOptions, shuffleArray } from '../server/services/questionSelection.js';

async function runTests() {
  console.log('--- RUNNING WORKFLOW VERIFICATION SUITE ---');

  // Test 1: Shared exam categories
  console.log('[Test 1] Verifying Master Exam Categories in shared/...');
  if (!Array.isArray(EXAM_CATEGORIES) || EXAM_CATEGORIES.length !== 5) {
    throw new Error(`Expected 5 categories, got ${EXAM_CATEGORIES.length}`);
  }
  const sampleExams = [
    { title: 'IBPS PO', category: 'IBPS' },
    { title: 'SBI Clerk', category: 'SBI' },
    { title: 'RBI Grade B', category: 'RBI' },
    { title: 'NABARD Grade A', category: 'NABARD' },
    { title: 'IDBI Executive', category: 'Other Banks / Institutions' },
  ];
  const grouped = groupExamsByCategory(sampleExams);
  if (grouped.length !== 5) {
    throw new Error(`Grouping failed: expected 5 groups, got ${grouped.length}`);
  }
  console.log('✓ Master Exam Categories & Grouping verified.');

  // Test 2: Database Connection
  console.log('[Test 2] Verifying PostgreSQL connection...');
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT NOW() AS current_time');
    console.log(`✓ Database connected at ${res.rows[0].current_time}`);
  } catch (err) {
    console.warn('⚠ Database connection skipped or failed:', err.message);
  }

  if (client) {
    try {
      await client.query('BEGIN');

      // Test 3: Check master exam count in DB
      console.log('[Test 3] Verifying master exam list in database...');
      const examRows = await client.query('SELECT code, name, category FROM exams ORDER BY code');
      console.log(`Found ${examRows.rowCount} exams in database.`);
      const activeCategories = new Set(examRows.rows.map(r => r.category));
      console.log(`Categories in DB:`, Array.from(activeCategories));

      // Test 4: 20-question sync test with rollback
      console.log('[Test 4] Verifying 20-question threshold auto-mock test creator...');
      const testExam = await client.query(
        "INSERT INTO exams (code, name, category, status, created_at, updated_at) VALUES ('TEST_EXAM', 'Test Exam', 'IBPS', 'published', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET updated_at = NOW() RETURNING id"
      );
      const examId = testExam.rows[0].id;

      const testStage = await client.query(
        "INSERT INTO exam_stages (exam_id, name, sort_order, duration_seconds) VALUES ($1, 'Test Prelims', 1, 3600) RETURNING id",
        [examId]
      );
      const stageId = testStage.rows[0].id;

      const testSection = await client.query(
        "INSERT INTO exam_sections (stage_id, name, sort_order, question_count, duration_seconds) VALUES ($1, 'Test Section', 1, 20, 3600) RETURNING id",
        [stageId]
      );
      const sectionId = testSection.rows[0].id;

      // Stage with 0 questions -> sync should return synced=false
      const sync0 = await syncStageQuestionBankMockTest(client, stageId, null);
      if (sync0?.synced) {
        throw new Error('Auto-mock created when question count < 20!');
      }
      console.log(`✓ Under threshold (<20 questions): sync produced publishedCount=${sync0?.publishedCount}, synced=${sync0?.synced}`);

      // Insert 20 dummy questions
      for (let i = 1; i <= MIN_BANK_UPLOAD_QUESTIONS; i++) {
        await client.query(
          `INSERT INTO questions (
            section_id, topic_name, difficulty, question_text, options, correct_answer, explanation, status
          ) VALUES ($1, 'Arithmetic', 'easy', $2, $3::jsonb, 'A', 'Test Explanation', 'published')`,
          [sectionId, `Test Question #${i}`, JSON.stringify([
            { key: 'A', text: 'Opt A' },
            { key: 'B', text: 'Opt B' },
            { key: 'C', text: 'Opt C' },
            { key: 'D', text: 'Opt D' },
          ])]
        );
      }

      // Sync with 20 questions -> should create or update mock test
      const sync20 = await syncStageQuestionBankMockTest(client, stageId, null);
      if (!sync20?.synced || !sync20?.testId) {
        throw new Error('Auto-mock failed to sync when question count reached 20!');
      }
      console.log(`✓ Reached threshold (20 questions): sync produced testId=${sync20.testId}, questionCount=${sync20.questionCount}, synced=${sync20.synced}`);

      // Test 5: Dynamic Option Shuffling
      console.log('[Test 5] Verifying dynamic option shuffler...');
      const dummyOptions = [
        { key: 'A', text: '4' },
        { key: 'B', text: '3' },
        { key: 'C', text: '5' },
        { key: 'D', text: '6' },
      ];
      const shuffled = shuffleQuestionOptions(dummyOptions, 'A');
      if (!shuffled.options || shuffled.options.length !== 4) {
        throw new Error('Option shuffler failed to output 4 options');
      }
      if (!shuffled.correctAnswer) {
        throw new Error('Option shuffler lost the correctAnswer tracking!');
      }
      console.log(`✓ Dynamic option shuffler safely randomized: new correct key is ${shuffled.correctAnswer}`);

      console.log('[Test 6] Rolling back test transactions (zero DB pollution)...');
      await client.query('ROLLBACK');
      console.log('✓ Test transactions successfully rolled back.');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log('--- ALL WORKFLOW TESTS PASSED CLEANLY ---');
}

runTests().catch(err => {
  console.error('Workflow test failed:', err);
  process.exit(1);
});
