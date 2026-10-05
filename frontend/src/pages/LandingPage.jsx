import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-4">
      {/* Hero Section */}
      <section className="text-center py-5">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-primary-subtle text-primary fw-medium small mb-3 border border-primary-subtle">
          <i className="bi bi-shield-lock-fill"></i> Enterprise Role-Based Task Management
        </div>
        <h1 className="display-4 fw-bold text-dark mb-3 tracking-tight">
          Simple, secure task management <br className="d-none d-md-block" /> for modern engineering teams.
        </h1>
        <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '640px' }}>
          TaskFlow pairs a robust, high-performance Laravel 11 REST API with a responsive React Single-Page Application, built to demonstrate production-grade architecture.
        </p>
        <div className="d-flex justify-content-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2">
              <i className="bi bi-speedometer2"></i> Open Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2">
                <i className="bi bi-box-arrow-in-right"></i> Sign In to Demo
              </Link>
              <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">
                Create Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Recruiter / Interviewer Quick Access Cards */}
      <section className="my-5">
        <div className="card bg-white border shadow-sm p-4 mx-auto" style={{ maxWidth: '780px' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-key-fill text-warning fs-4"></i>
            <h5 className="fw-bold mb-0 text-dark">Evaluation Demo Credentials</h5>
          </div>
          <p className="small text-muted mb-3">
            Pre-seeded test accounts with realistic tasks and audit logs are ready for instant recruiter testing:
          </p>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border">
                <div className="badge bg-primary mb-2">Administrator Role</div>
                <div className="small"><strong>Email:</strong> <code>admin@taskflow.dev</code></div>
                <div className="small"><strong>Password:</strong> <code>Password123!</code></div>
                <div className="small text-muted mt-2">
                  <i className="bi bi-check-circle text-success me-1"></i> Global task management, user inspections, immutable audit logs.
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border">
                <div className="badge bg-secondary mb-2">Standard User Role</div>
                <div className="small"><strong>Email:</strong> <code>demo@taskflow.dev</code></div>
                <div className="small"><strong>Password:</strong> <code>Password123!</code></div>
                <div className="small text-muted mt-2">
                  <i className="bi bi-shield-check text-primary me-1"></i> Strict tenant isolation: can only access and modify owned tasks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="my-5">
        <h3 className="fw-bold text-center text-dark mb-4">Engineering Capabilities</h3>
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card h-100 p-4 card-hover">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-database-check"></i></div>
              <h5 className="fw-bold">Relational &amp; Query Optimized</h5>
              <p className="small text-muted mb-0">
                MySQL 8.0 schema with composite B-Tree indexes <code>(user_id, status, due_date)</code>, foreign key constraints, and sub-millisecond query plans verified via <code>EXPLAIN ANALYZE</code>.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 p-4 card-hover">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-shield-check"></i></div>
              <h5 className="fw-bold">Rigorous RBAC Security</h5>
              <p className="small text-muted mb-0">
                Sanctum token authentication, rate limiting, and Laravel Policies on all task mutations preventing Insecure Direct Object References (IDOR).
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 p-4 card-hover">
              <div className="text-primary fs-3 mb-2"><i className="bi bi-stars"></i></div>
              <h5 className="fw-bold">Resilient AI Classification</h5>
              <p className="small text-muted mb-0">
                Integrated Google Gemini AI task classification and priority suggestion with an automatic deterministic heuristic fallback for offline zero-failure resilience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
