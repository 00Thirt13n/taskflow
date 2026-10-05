import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container-custom" aria-live="polite">
        {toasts.map((toast) => {
          const bgClass = toast.type === 'danger' ? 'bg-danger text-white' :
                          toast.type === 'warning' ? 'bg-warning text-dark' :
                          toast.type === 'info' ? 'bg-info text-white' : 'bg-success text-white';
          const iconClass = toast.type === 'danger' ? 'bi-exclamation-octagon-fill' :
                            toast.type === 'warning' ? 'bi-exclamation-triangle-fill' :
                            toast.type === 'info' ? 'bi-info-circle-fill' : 'bi-check-circle-fill';

          return (
            <div
              key={toast.id}
              className={`toast show align-items-center ${bgClass} border-0 shadow-lg`}
              role="alert"
              style={{ minWidth: '280px' }}
            >
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <i className={`bi ${iconClass} fs-5`}></i>
                  <span>{toast.message}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
