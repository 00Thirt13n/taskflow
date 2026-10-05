import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      addToast('Logged in successfully. Welcome!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Failed to log in with demo credentials', 'danger');
    }
  };

  return (
    <div className="py-4">
      {/* Hero Section */}
      <section className="text-center py-5">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-primary-subtle text-primary fw-medium small mb-3 border border-primary-subtle">
          <i className="bi bi-shield-check"></i> Enterprise Work Management Platform
        </div>
        <h1 className="display-4 fw-bold text-dark mb-3 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Work should move forward.
        </h1>
        <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
          A focused work management platform for engineering teams that need visibility, ownership, and predictable delivery across projects.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm">
              <i className="bi bi-grid-1x2"></i> Open Workspace
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm">
                <i className="bi bi-box-arrow-in-right"></i> Sign In to Demo
              </Link>
              <a
                href="/openapi.yaml"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center gap-2"
              >
                <i className="bi bi-file-earmark-code"></i> OpenAPI 3.0 Spec
              </a>
            </>
          )}
        </div>
      </section>

      {/* Recruiter / Interviewer 1-Click Persona Access Cards */}
      <section className="my-5">
        <div className="tf-card p-4 mx-auto" style={{ maxWidth: '820px' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-badge text-primary fs-4"></i>
              <h5 className="fw-bold mb-0">Evaluation Demo Personas</h5>
            </div>
            <span className="badge bg-light text-muted border">Instant 1-Click Access</span>
          </div>
          <p className="small text-muted mb-4">
            Pre-seeded test accounts populated with realistic projects (Website Redesign, Mobile App v2, Infrastructure &amp; Scaling), subtasks, comments, dependencies, and audit trails:
          </p>

          <div className="row g-3">
            {/* Admin Persona */}
            <div className="col-12 col-md-6">
              <div className="p-3 rounded bg-light border h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary">Administrator</span>
                    <span className="small text-muted">Alexander Vance</span>
                  </div>
                  <div className="small"><strong>Email:</strong> <code>admin@taskflow.dev</code></div>
                  <div className="small text-muted mt-2">
                    <i className="bi bi-check-circle text-success me-1"></i> System-wide task visibility, user role management, system health diagnostics, immutable audit trails.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary mt-3 w-100"
                  onClick={() => handleQuickLogin('admin@taskflow.dev', 'Password123!')}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Log In as Administrator
                </button>
              </div>
            </div>

            {/* Standard User Persona */}
            <div className="col-12 col-md-6">
              <div className="p-3 rounded bg-light border h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-secondary">Lead Developer</span>
                    <span className="small text-muted">Elena Rostova</span>
                  </div>
                  <div className="small"><strong>Email:</strong> <code>demo@taskflow.dev</code></div>
                  <div className="small text-muted mt-2">
                    <i className="bi bi-shield-check text-primary me-1"></i> Project member access, personal My Work inbox, drag-and-drop Kanban board, subtask management.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mt-3 w-100"
                  onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!')}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Log In as Standard User
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Feature Pillars */}
      <section className="my-5">
        <h3 className="fw-bold text-center mb-4">Core Platform Capabilities</h3>
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="tf-card h-100 p-4">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-kanban"></i></div>
              <h5 className="fw-bold">Multi-View Planning</h5>
              <p className="small text-muted mb-0">
                Switch seamlessly between an interactive tabular list, a drag-and-drop Kanban board, a monthly calendar, and a timeline schedule bar chart.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="tf-card h-100 p-4">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-stars"></i></div>
              <h5 className="fw-bold">Resilient AI Assistant</h5>
              <p className="small text-muted mb-0">
                Natural language task creation, automatic subtask breakdown generation, and description refinement powered by Google Gemini with deterministic heuristic fallback.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="tf-card h-100 p-4">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-database-check"></i></div>
              <h5 className="fw-bold">Engineered for Scale</h5>
              <p className="small text-muted mb-0">
                MySQL 8.0 schema with composite B-Tree indexes delivering sub-millisecond queries (0.068ms), RBAC policies preventing IDOR, and append-only audit logging.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
