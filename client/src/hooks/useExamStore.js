// ============================================================================
// ZUSTAND EXAM STORE HOOK: CATALOGUE & TARGET EXAMINATION STATE
// ============================================================================
// Centralizes banking examination listings, stages, and sections.
// ============================================================================

import { create } from "zustand";

export const useExamStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  exams: [],
  selectedExamId: "",
  loading: false,
  error: null,

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  setExams: (exams) => set({ exams }),

  setSelectedExamId: (id) => set({ selectedExamId: id }),

  // Fetch all active exams and stages from the catalogue API
  fetchExams: async () => {
    if (get().exams.length > 0) return get().exams; // Use cached if available
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/exams", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load examinations catalogue");
      const data = await response.json();
      const exams = data.exams || [];
      set({ exams, loading: false });
      return exams;
    } catch (err) {
      set({ loading: false, error: err.message });
      return [];
    }
  }
}));
