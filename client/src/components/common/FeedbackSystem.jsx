// ============================================================================
// UNIFIED FEEDBACK SYSTEM: TOAST, ALERT & MODAL
// ============================================================================
// Implements the three essential interaction design patterns:
//
// 1. TOAST (Quick Feedback Message)
//    - Non-blocking notification in corner
//    - Auto-dismisses after 3.5 seconds
//    - Best for: "Product added successfully!", "Role updated", errors
//
// 2. ALERT (Important Warning or Information)
//    - Prominent banner or floating card with bold title + description
//    - Stays until manually dismissed with [X]
//    - Best for: Warnings, critical notices, "Exam in draft status"
//
// 3. MODAL (User Interaction or Decision)
//    - Screen-blocking dimmed backdrop overlay
//    - Centered dialog with top icon, title, description, and [Cancel] / [Confirm]
//    - Blocks screen until user makes an explicit decision
//    - Best for: Destructive actions, role promotions/demotions, account suspensions
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X
} from "lucide-react";

export const FeedbackContext = createContext(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return ctx;
}

/**
 * FeedbackProvider Root Component
 * Wraps the app and renders Toast, Alert, and Modal layers
 */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modalState, setModalState] = useState(null);

  // --------------------------------------------------------------------------
  // 1. TOAST DISPATCHER (Quick non-blocking feedback)
  // --------------------------------------------------------------------------
  const showToast = useCallback((message, type = "success", duration = 3800) => {
    if (!message) return;
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const text = typeof message === "object" ? message.message || message.error || JSON.stringify(message) : String(message);
    const toastType = typeof message === "object" && message.type ? message.type : type;

    setToasts((prev) => [...prev.slice(-3), { id, text, type: toastType }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper object for convenient toast syntax: toast.success('...'), toast.error('...')
  const toast = {
    success: (msg, dur) => showToast(msg, "success", dur),
    error: (msg, dur) => showToast(msg, "error", dur),
    warning: (msg, dur) => showToast(msg, "warning", dur),
    info: (msg, dur) => showToast(msg, "info", dur),
    dismiss: dismissToast
  };

  // --------------------------------------------------------------------------
  // 2. ALERT DISPATCHER (Important warnings & persistent notices)
  // --------------------------------------------------------------------------
  const showAlert = useCallback(({ title, message, type = "warning" }) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setAlerts((prev) => [...prev, { id, title, message, type }]);
    return id;
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const alert = {
    show: showAlert,
    warning: (title, message) => showAlert({ title, message, type: "warning" }),
    info: (title, message) => showAlert({ title, message, type: "info" }),
    error: (title, message) => showAlert({ title, message, type: "error" }),
    dismiss: dismissAlert
  };

  // --------------------------------------------------------------------------
  // 3. MODAL CONFIRMATION (Promise-based decision dialog)
  // --------------------------------------------------------------------------
  const confirm = useCallback(({
    title = "Are you sure?",
    message = "Please confirm this action to proceed.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "primary", // 'primary' | 'danger' | 'warning'
    icon = null // 'shield' | 'trash' | 'user' | 'alert'
  } = {}) => {
    return new Promise((resolve) => {
      setModalState({
        title,
        message,
        confirmText,
        cancelText,
        type,
        icon,
        resolve: (val) => {
          setModalState(null);
          resolve(val);
        }
      });
    });
  }, []);

  return (
    <FeedbackContext.Provider value={{ toast, alert, confirm, showToast, dismissToast }}>
      {children}

      {/* Layer 1: Floating Persistent Alerts */}
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />

      {/* Layer 2: Floating Quick Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Layer 3: Screen-Blocking Decision Modal */}
      {modalState && (
        <ConfirmModal
          modal={modalState}
          onConfirm={() => modalState.resolve(true)}
          onCancel={() => modalState.resolve(false)}
        />
      )}
    </FeedbackContext.Provider>
  );
}

// ============================================================================
// TOAST CONTAINER (Quick Non-Blocking Feedback Messages)
// ============================================================================
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || !toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {t.type === "error" ? (
                <AlertCircle size={18} />
              ) : t.type === "warning" ? (
                <AlertTriangle size={18} />
              ) : t.type === "info" ? (
                <Info size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </span>
            <span>{t.text}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ALERT CONTAINER (Important Warning or Information Banner/Cards)
// ============================================================================
export function AlertContainer({ alerts, onDismiss }) {
  if (!alerts || !alerts.length) return null;

  return (
    <div className="alert-stack-container" role="region" aria-label="Important Notices">
      {alerts.map((a) => (
        <div key={a.id} className={`app-alert-card app-alert-${a.type}`}>
          <div className="app-alert-icon-wrap">
            {a.type === "error" ? (
              <AlertCircle size={22} />
            ) : a.type === "info" ? (
              <Info size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
          </div>
          <div className="app-alert-body">
            {a.title && <h4 className="app-alert-title">{a.title}</h4>}
            {a.message && <p className="app-alert-text">{a.message}</p>}
          </div>
          <button
            type="button"
            className="app-alert-close-btn"
            onClick={() => onDismiss(a.id)}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CONFIRM MODAL (Screen-Blocking User Interaction / Decision Dialog)
// ============================================================================
export function ConfirmModal({ modal, onConfirm, onCancel }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Determine icon to display in the circular badge
  const renderIcon = () => {
    if (modal.icon === "trash" || modal.type === "danger") {
      return <Trash2 size={26} />;
    }
    if (modal.icon === "shield" || modal.icon === "admin") {
      return <ShieldCheck size={26} />;
    }
    if (modal.icon === "user" || modal.icon === "student") {
      return <UserCheck size={26} />;
    }
    if (modal.type === "warning") {
      return <AlertTriangle size={26} />;
    }
    return <AlertCircle size={26} />;
  };

  const badgeTheme = modal.type === "danger" ? "danger" : modal.icon === "shield" ? "lavender" : modal.type === "warning" ? "amber" : "primary";

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button [X] */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Top Centered Circular Icon Badge */}
        <div className={`modal-icon-badge ${badgeTheme}`}>
          {renderIcon()}
        </div>

        {/* Modal Title */}
        <h3 className="modal-title">{modal.title}</h3>

        {/* Modal Message */}
        <p className="modal-message">{modal.message}</p>

        {/* Action Buttons: [Cancel] and [Confirm/Action] */}
        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
          >
            {modal.cancelText || "Cancel"}
          </button>
          <button
            type="button"
            className={`modal-btn modal-btn-confirm ${modal.type === "danger" ? "btn-danger" : modal.icon === "shield" ? "btn-lavender" : "btn-primary"}`}
            onClick={onConfirm}
            autoFocus
          >
            {modal.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
