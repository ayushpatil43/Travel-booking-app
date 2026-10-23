import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
        >
          {t.type === 'error' ? (
            <AlertCircle size={18} style={{ color: '#ff8a80', flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} style={{ color: 'var(--sage-300)', flexShrink: 0 }} />
          )}

          <div style={{ flex: 1, fontSize: '0.875rem' }}>
            {t.message}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
