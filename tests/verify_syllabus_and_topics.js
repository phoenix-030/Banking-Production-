import "dotenv/config";
import assert from "node:assert/strict";
import {
  BANKING_SYLLABUS,
  mapSectionNameToSubject,
  getTopicsForSection,
  getSubtopicsForTopic
} from "../shared/bankingSyllabus.js";
import { pool } from "../server/db.js";

async function testSyllabus() {
  console.log("--- RUNNING SYLLABUS & TOPIC MANAGEMENT VERIFICATION ---");

  // 1. Verify 6 core subjects in banking syllabus
  assert.equal(BANKING_SYLLABUS.length, 6, "Must have exactly 6 core banking subjects");
  const subjectNames = BANKING_SYLLABUS.map((s) => s.shortName);
  console.log(`✓ 6 Core Banking subjects verified: ${subjectNames.join(", ")}`);

  // 2. Verify section name mapping
  assert.equal(mapSectionNameToSubject("Quantitative Aptitude")?.name, "Quantitative Aptitude / Numerical Ability");
  assert.equal(mapSectionNameToSubject("Data Analysis & Interpretation")?.name, "Quantitative Aptitude / Numerical Ability");
  assert.equal(mapSectionNameToSubject("Reasoning Ability")?.name, "Reasoning Ability");
  assert.equal(mapSectionNameToSubject("English Language")?.name, "English Language");
  assert.equal(mapSectionNameToSubject("General Awareness")?.name, "General Awareness / Current Affairs");
  assert.equal(mapSectionNameToSubject("Financial & Banking Awareness")?.name, "Banking & Financial Awareness");
  assert.equal(mapSectionNameToSubject("Computer Aptitude")?.name, "Computer Awareness");
  console.log("✓ Section name to syllabus subject mapping verified");

  // 3. Verify topics for Quantitative Aptitude
  const quantTopics = getTopicsForSection("Quantitative Aptitude");
  assert.ok(quantTopics.length >= 18, `Expected at least 18 quant topics, got ${quantTopics.length}`);
  const diTopic = quantTopics.find((t) => t.name === "Data Interpretation");
  assert.ok(diTopic, "Data Interpretation must exist in quant topics");
  assert.ok(diTopic.subtopics.length >= 6, "Data Interpretation must have subtopics (Table DI, Bar Graph, etc.)");

  const diSubtopics = getSubtopicsForTopic("Quantitative Aptitude", "Data Interpretation");
  assert.ok(diSubtopics.includes("Table DI"), "Table DI must be a subtopic");
  assert.ok(diSubtopics.includes("Pie Chart"), "Pie Chart must be a subtopic");
  console.log("✓ Data Interpretation topics and subtopics verified");

  // 4. Verify topics for Reasoning Ability
  const reasoningTopics = getTopicsForSection("Reasoning Ability");
  assert.ok(reasoningTopics.length >= 18, `Expected at least 18 reasoning topics, got ${reasoningTopics.length}`);
  const puzzleSubtopics = getSubtopicsForTopic("Reasoning", "Puzzles");
  assert.ok(puzzleSubtopics.includes("Box Puzzle"), "Box Puzzle subtopic verified");
  console.log("✓ Reasoning topics and subtopics verified");

  // 5. Verify database columns
  const columnCheck = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'subtopic_name'
  `);
  assert.equal(columnCheck.rowCount, 1, "questions table must have subtopic_name column");
  console.log("✓ Database schema verified: questions.subtopic_name exists");

  // 6. Test topic upsert in database with rollback
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sectionRes = await client.query("SELECT id FROM exam_sections LIMIT 1");
    if (sectionRes.rowCount) {
      const sectionId = sectionRes.rows[0].id;
      // Insert test parent topic
      const parentTopicRes = await client.query(
        `INSERT INTO topics(section_id, name)
         VALUES ($1, 'Test Verification Topic')
         ON CONFLICT(section_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [sectionId]
      );
      const parentId = parentTopicRes.rows[0].id;
      assert.ok(parentId, "Parent topic inserted");

      // Insert test subtopic
      const subtopicRes = await client.query(
        `INSERT INTO topics(section_id, parent_topic_id, name)
         VALUES ($1, $2, 'Test Verification Subtopic')
         ON CONFLICT(section_id, name) DO UPDATE SET parent_topic_id = EXCLUDED.parent_topic_id
         RETURNING id`,
        [sectionId, parentId]
      );
      assert.ok(subtopicRes.rows[0].id, "Subtopic inserted with parent_topic_id");

      // Insert question with subtopic
      const qRes = await client.query(
        `INSERT INTO questions
          (section_id, topic_id, topic_name, subtopic_name, difficulty, question_type,
           language, question_text, options, correct_answer, explanation, marks, negative_marks,
           status, content_hash)
         VALUES
          ($1, $2, 'Test Verification Topic', 'Test Verification Subtopic', 'medium', 'mcq',
           'English', 'Verification question text?', '[]'::jsonb, 'A', 'Expl', 1, 0.25,
           'draft', 'test-hash-1234')
         RETURNING id, topic_name, subtopic_name`,
        [sectionId, parentId]
      );
      assert.equal(qRes.rows[0].subtopic_name, "Test Verification Subtopic", "Question stored subtopic_name");
      console.log("✓ Question insertion and subtopic relation verified in DB");
    }
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }

  await pool.end();
  console.log("--- ALL SYLLABUS & TOPIC TESTS PASSED CLEANLY ---");
}

testSyllabus().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
