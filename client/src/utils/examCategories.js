export const EXAM_CATEGORIES = [
  "IBPS",
  "SBI",
  "RBI",
  "NABARD",
  "Other Banks / Institutions",
];

export function groupExamsByCategory(exams = []) {
  const buckets = new Map();
  for (const cat of EXAM_CATEGORIES) buckets.set(cat, []);
  for (const exam of exams) {
    const key = exam.category?.trim() || "Other Banks / Institutions";
    const list = buckets.get(key) ?? [];
    list.push(exam);
    buckets.set(key, list);
  }
  const groups = [];
  for (const [category, items] of buckets.entries()) {
    if (items.length) groups.push({ category, exams: items });
  }
  return groups;
}

// Re-export ExamOptGroups for backward compatibility
export { ExamOptGroups } from "../components/common/ExamOptGroups.jsx";
