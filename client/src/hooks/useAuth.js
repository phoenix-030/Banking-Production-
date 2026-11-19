// ============================================================================
// ZUSTAND AUTH HOOK: USER IDENTITY & SESSION MANAGEMENT
// ============================================================================
// Centralizes user authentication, session verification, login, registration,
// and role identification platform-wide.
// ============================================================================

import { create } from "zustand";

export const useAuth = create((set, get) => ({
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  user: null,
  loading: true,
  error: null,

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  setUser: (user) => set({ user, loading: false }),

  // Verify active session with backend API
  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, loading: false });
        return data.user;
      }
      set({ user: null, loading: false });
      return null;
    } catch (err) {
      set({ user: null, loading: false, error: err.message });
      return null;
    }
  },

  // Log in student or administrator
  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      set({ user: data.user, loading: false });
      return { success: true, user: data.user };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Register new student account
  register: async ({ fullName, email, password, mobile }) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, password, mobile })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      set({ user: data.user, loading: false });
      return { success: true, user: data.user };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Log out current user
  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      set({ user: null, loading: false });
    }
  },

  // Update student's target examination
  updateTargetExam: async (targetExamId) => {
    try {
      const response = await fetch("/api/auth/target-exam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetExamId })
      });
      if (response.ok) {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, target_exam_id: targetExamId }
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Target exam update failed:", err);
      return false;
    }
  }
}));
