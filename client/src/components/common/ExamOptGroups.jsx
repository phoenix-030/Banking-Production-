import React from "react";
import { groupExamsByCategory } from "../../utils/examCategories.js";

/**
 * Renders categorized <optgroup> and <option> tags for examination select inputs.
 */
export function ExamOptGroups({ exams = [], getKey, getValue, getLabel }) {
  const indexMap = new Map();
  exams.forEach((exam, idx) => indexMap.set(exam, idx));
  const groups = groupExamsByCategory(exams);

  return (
    <>
      {groups.map((group) => (
        <optgroup
          key={group.category}
          label={`${group.category} (${group.exams.length})`}
        >
          {group.exams.map((exam) => {
            const idx = indexMap.get(exam) ?? 0;
            return (
              <option key={getKey(exam, idx)} value={getValue(exam, idx)}>
                {getLabel(exam)}
              </option>
            );
          })}
        </optgroup>
      ))}
    </>
  );
}

export default ExamOptGroups;
