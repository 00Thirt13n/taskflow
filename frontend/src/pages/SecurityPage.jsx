import React from 'react';
import { Link } from 'react-router-dom';

export default function SecurityPage() {
  return (
    <div className="py-4">
      {/* Security Hero */}
      <section className="text-center py-5">
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 mb-3">
          <i className="bi bi-shield-check me-1"></i> Architecture-Based Security
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '840px' }}>
          Security & control built into every layer.
        </h1>
        <p className="hero-subhead">
          TaskFlow is built on security-conscious engineering principles. We rely on strict server-side authorization boundaries, rate limiting, and immutable audit trails rather than cosmetic frontend hiding.
        </p>
      </section>

      {/* Security Pillars Grid */}
      <section className="py-4 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                <i className="bi bi-shield-lock"></i>
              </div>
              <h5 className="fw-bold text-body mb-2">Role-Based Access Control (RBAC)</h5>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                Enforced authoritatively on the backend via Laravel Policies (<code>TaskPolicy</code>, <code>ProjectPolicy</code>, <code>AdminPolicy</code>). Frontend button states are strictly a convenience; unauthorized API requests are intercepted and rejected with <code>403 Forbidden</code>.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <i className="bi bi-key"></i>
              </div>
              <h5 className="fw-bold text-body mb-2">Insecure Direct Object Reference (IDOR) Mitigation</h5>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                Every task, project, and comment mutation cryptographically verifies user ownership and project membership before execution. A tenant member cannot read or mutate another tenant’s deliverables by guessing primary keys.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <h5 className="fw-bold text-body mb-2">Append-Only Immutable Audit Trail</h5>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                Critical administrative events, role adjustments, status changes, and task deletions are permanently logged in the <code>audit_logs</code> table with client IP, user agent, actor ID, and JSON attribute deltas. Audit logs lack an <code>updated_at</code> column to prevent tampering.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <i className="bi bi-speedometer"></i>
              </div>
              <h5 className="fw-bold text-body mb-2">API Rate Limiting & Denial-of-Service Defense</h5>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                Authentication endpoints (<code>/api/login</code> and <code>/api/register</code>) enforce strict rate limits (10 attempts per minute) to thwart brute-force and credential stuffing attacks. Rate limit exceeded responses return <code>429 Too Many Requests</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Specifications Table */}
      <section className="py-5 my-3 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <h3 className="fw-bold text-body mb-4">Security Specification Summary</h3>
        <div className="tf-card overflow-hidden">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light border-bottom">
              <tr>
                <th className="px-3 py-2 small fw-bold text-uppercase text-muted">Domain</th>
                <th className="px-3 py-2 small fw-bold text-uppercase text-muted">Implementation Strategy</th>
                <th className="px-3 py-2 small fw-bold text-uppercase text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="small">
              <tr>
                <td className="px-3 py-3 fw-bold text-body">Authentication</td>
                <td className="px-3 py-3 text-muted">Laravel Sanctum Bearer tokens with Bcrypt work factor 12 and immediate token revocation on logout.</td>
                <td className="px-3 py-3"><span className="badge bg-success bg-opacity-10 text-success">Verified</span></td>
              </tr>
              <tr>
                <td className="px-3 py-3 fw-bold text-body">Data Validation</td>
                <td className="px-3 py-3 text-muted">Authoritative Form Requests with typed enums (TaskStatus, TaskPriority) and strict length limits.</td>
                <td className="px-3 py-3"><span className="badge bg-success bg-opacity-10 text-success">Verified</span></td>
              </tr>
              <tr>
                <td className="px-3 py-3 fw-bold text-body">Database Security</td>
                <td className="px-3 py-3 text-muted">Parameterized PDO prepared statements across Eloquent ORM with strict foreign key constraints.</td>
                <td className="px-3 py-3"><span className="badge bg-success bg-opacity-10 text-success">Verified</span></td>
              </tr>
              <tr>
                <td className="px-3 py-3 fw-bold text-body">Zero Stack Traces</td>
                <td className="px-3 py-3 text-muted">Centralized exception handling returns sanitized JSON payloads with unique request IDs; no debug traces.</td>
                <td className="px-3 py-3"><span className="badge bg-success bg-opacity-10 text-success">Verified</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <h4 className="fw-bold text-body mb-2">Explore the Security Architecture</h4>
        <p className="text-muted mb-4">Read our complete technical specifications in the documentation suite.</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/login" className="btn btn-primary btn-lg px-4">
            Try Live Demo
          </Link>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-lg px-4">
            OpenAPI Spec
          </a>
        </div>
      </section>
    </div>
  );
}
