import React from 'react';
import { Link } from 'react-router-dom';
import TaskFlowLogo from '../components/TaskFlowLogo';

export default function ForbiddenPage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3" style={{ backgroundColor: 'var(--tf-bg-main)' }}>
      <div className="error-page-card">
        <TaskFlowLogo size="lg" className="mb-4 justify-content-center" />
        <div className="display-1 fw-bold text-danger opacity-75 mb-2">403</div>
        <h3 className="fw-bold text-body mb-2">Restricted Access</h3>
        <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
          You do not have administrative permissions to view or mutate this area. Role-based access control is enforced authoritatively on all endpoints.
        </p>

        <div className="d-flex justify-content-center gap-2">
          <Link to="/app/home" className="btn btn-primary">
            <i className="bi bi-grid-fill me-1"></i> Return to Workspace
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
