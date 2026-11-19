// ============================================================================
// UNIFIED FEEDBACK SYSTEM: TOAST, ALERT & MODAL
// ============================================================================
// Connects to the Zustand useFeedback hook and renders the three visual tiers:
// 1. ToastContainer (Quick non-blocking notifications in top-right)
// 2. AlertContainer (Prominent warning banners in top-center)
// 3. ConfirmModal (Screen-blocking decision confirmation dialogs)
// ============================================================================

import { useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Trash2,
  UserCheck,
  X
} from "lucide-react";
import { useFeedback } from "../../hooks/useFeedback";

// Re-export useFeedback for seamless backward compatibility
export { useFeedback };

/**
 * FeedbackProvider Component
 * Renders children alongside the floating feedback layers powered by Zustand
 */
export function FeedbackProvider({ children }) {
  const { toasts, alerts, modal, dismissToast, dismissAlert, closeModal } = useFeedback();

  return (
    <>
      {children}

      {/* Layer 1: Floating Persistent Alerts */}
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />

      {/* Layer 2: Floating Quick Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Layer 3: Screen-Blocking Decision Modal */}
      {modal && (
        <ConfirmModal
          modal={modal}
          onConfirm={() => closeModal(true)}
          onCancel={() => closeModal(false)}
        />
      )}
    </>
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

  const badgeTheme =
    modal.type === "danger"
      ? "danger"
      : modal.icon === "shield"
      ? "lavender"
      : modal.type === "warning"
      ? "amber"
      : "primary";

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
            className={`modal-btn modal-btn-confirm ${
              modal.type === "danger"
                ? "btn-danger"
                : modal.icon === "shield"
                ? "btn-lavender"
                : "btn-primary"
            }`}
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
