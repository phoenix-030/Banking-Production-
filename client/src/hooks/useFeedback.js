// ============================================================================
// ZUSTAND FEEDBACK HOOK: TOAST, ALERT & MODAL STATE ENGINE
// ============================================================================
// Centralizes all user feedback notifications without context provider boilerplate.
// Provides 3 interaction tiers:
// 1. Toast (Quick non-blocking feedback in top-right)
// 2. Alert (Important persistent notices in center banner)
// 3. Modal (Screen-blocking decision confirmation dialogs)
// ============================================================================

import { create } from "zustand";

export const useFeedback = create((set, get) => ({
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  toasts: [],
  alerts: [],
  modal: null,

  // --------------------------------------------------------------------------
  // 1. Toast Actions (Quick non-blocking feedback)
  // --------------------------------------------------------------------------
  showToast: (message, type = "success", duration = 3800) => {
    if (!message) return null;
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const text =
      typeof message === "object"
        ? message.message || message.error || JSON.stringify(message)
        : String(message);
    const toastType =
      typeof message === "object" && message.type ? message.type : type;

    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id, text, type: toastType }]
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }
    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  // Helper methods: useFeedback.getState().toast.success(...) or hook destructuring
  toast: {
    success: (msg, dur) => get().showToast(msg, "success", dur),
    error: (msg, dur) => get().showToast(msg, "error", dur),
    warning: (msg, dur) => get().showToast(msg, "warning", dur),
    info: (msg, dur) => get().showToast(msg, "info", dur),
    dismiss: (id) => get().dismissToast(id)
  },

  // --------------------------------------------------------------------------
  // 2. Alert Actions (Persistent warnings and notices)
  // --------------------------------------------------------------------------
  showAlert: ({ title, message, type = "warning" }) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      alerts: [...state.alerts, { id, title, message, type }]
    }));
    return id;
  },

  dismissAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id)
    }));
  },

  alert: {
    show: (config) => get().showAlert(config),
    warning: (title, message) => get().showAlert({ title, message, type: "warning" }),
    info: (title, message) => get().showAlert({ title, message, type: "info" }),
    error: (title, message) => get().showAlert({ title, message, type: "error" }),
    dismiss: (id) => get().dismissAlert(id)
  },

  // --------------------------------------------------------------------------
  // 3. Modal Actions (Screen-blocking confirmation dialog)
  // --------------------------------------------------------------------------
  confirm: ({
    title = "Are you sure?",
    message = "Please confirm this action to proceed.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "primary", // 'primary' | 'danger' | 'warning'
    icon = null // 'shield' | 'trash' | 'user' | 'alert'
  } = {}) => {
    return new Promise((resolve) => {
      set({
        modal: {
          title,
          message,
          confirmText,
          cancelText,
          type,
          icon,
          resolve: (val) => {
            set({ modal: null });
            resolve(val);
          }
        }
      });
    });
  },

  closeModal: (result = false) => {
    const modal = get().modal;
    if (modal?.resolve) {
      modal.resolve(result);
    } else {
      set({ modal: null });
    }
  }
}));
