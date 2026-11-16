-- Migration 015: Banking Exam Syllabus, Topics & Subtopics
-- Supports the full Indian Banking Examination syllabus hierarchy:
-- Exam -> Subject/Section -> Topic -> Subtopic -> Difficulty -> Questions

-- 1. Ensure subtopic support on questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS subtopic_name TEXT NOT NULL DEFAULT '';

-- 2. Enhanced topic metadata on topics table
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Composite performance index for rapid topic & subtopic queries
CREATE INDEX IF NOT EXISTS idx_questions_section_topic_subtopic
  ON questions(section_id, topic_name, subtopic_name)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty
  ON questions(topic_name, difficulty)
  WHERE status = 'published';
