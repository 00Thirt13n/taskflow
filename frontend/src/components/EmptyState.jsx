import React from 'react';

export default function EmptyState({ icon = 'bi-inbox', title = 'No tasks found', message = 'There are no tasks matching your current filters.', actionText, onAction }) {
  return (
    <div className="card text-center p-5 my-4 border-dashed bg-white">
      <div className="card-body">
        <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
          <i className={`bi ${icon} fs-2 text-primary`}></i>
        </div>
        <h5 className="fw-bold text-dark mb-1">{title}</h5>
        <p className="text-muted small mx-auto" style={{ maxWidth: '380px' }}>{message}</p>
        {actionText && onAction && (
          <button type="button" className="btn btn-primary btn-sm mt-3 px-3" onClick={onAction}>
            <i className="bi bi-plus-lg me-1"></i> {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
