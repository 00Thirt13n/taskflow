import React from 'react';
import { Link } from 'react-router-dom';
import TaskFlowLogo from '../components/TaskFlowLogo';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3" style={{ backgroundColor: 'var(--tf-bg-main)' }}>
      <div className="error-page-card">
        <TaskFlowLogo size="lg" className="mb-4 justify-content-center" />
        <div className="display-1 fw-bold text-muted opacity-50 mb-2">404</div>
        <h3 className="fw-bold text-body mb-2">Page Not Found</h3>
        <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
          The work item, project, or destination you were looking for doesn't exist or may have been moved.
        </p>

        <div className="d-flex justify-content-center gap-2">
          {isAuthenticated ? (
            <Link to="/app/home" className="btn btn-primary">
              <i className="bi bi-grid-fill me-1"></i> Return to Workspace
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary">
              <i className="bi bi-house-door-fill me-1"></i> Return to Homepage
            </Link>
          )}
          <Link to="/contact" className="btn btn-outline-secondary">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
