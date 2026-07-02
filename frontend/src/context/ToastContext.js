import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const ToastContext = createContext(null);

const DEFAULT_DURATION = {
  success: 4500,
  error: 6500,
  info: 4500,
  warning: 5500,
};

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

let idCounter = 0;

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-item--${toast.type}`}
          role="alert"
        >
          <span className="toast-item-icon" aria-hidden="true">
            {ICONS[toast.type] || ICONS.info}
          </span>
          <p className="toast-item-message">{toast.message}</p>
          <div className="toast-item-actions">
            {toast.action && (
              <button
                type="button"
                className="toast-item-action"
                onClick={() => {
                  toast.action.onClick?.();
                  onDismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className="toast-item-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', options = {}) => {
    if (!message) return null;

    const id = ++idCounter;
    const duration = options.duration ?? DEFAULT_DURATION[type] ?? 4500;
    const toast = {
      id,
      message,
      type,
      action: options.action || null,
    };

    setToasts((prev) => [...prev.slice(-4), toast]);

    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (message, options) => show(message, 'success', options),
    error: (message, options) => show(message, 'error', options),
    info: (message, options) => show(message, 'info', options),
    warning: (message, options) => show(message, 'warning', options),
    dismiss,
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: () => null,
      error: () => null,
      info: () => null,
      warning: () => null,
      dismiss: () => {},
    };
  }
  return context;
}
