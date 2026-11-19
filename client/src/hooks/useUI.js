// ============================================================================
// ZUSTAND UI HOOK: NAVIGATION & WORKSPACE VIEW COORDINATION
// ============================================================================
// Centralizes active navigation tabs, mobile menu responsiveness, and
// proctoring companion tab lockdown states.
// ============================================================================

import { create } from "zustand";

export const useUI = create((set) => ({
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  activeTab: "Overview",
  menuOpen: false,
  lockedOutInfo: null,

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  setActiveTab: (tab) => set({ activeTab: tab, menuOpen: false }),

  setMenuOpen: (open) => set({ menuOpen: open }),

  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  setLockedOutInfo: (info) => set({ lockedOutInfo: info }),

  resetUI: () => set({ activeTab: "Overview", menuOpen: false, lockedOutInfo: null })
}));
