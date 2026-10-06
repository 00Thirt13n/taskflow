import React from 'react';
import { Link } from 'react-router-dom';

export default function SecurityPage() {
  return (
    <div className="tf-page-container py-5">
      {/* ── Security Hero ── */}
      <section className="text-center pt-3 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>ZERO-TRUST ARCHITECTURE</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Cryptographic Integrity</span>
          </div>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '880px' }}>
          Security & control built into <span className="text-gradient-blue">every single layer</span>.
        </h1>
        <p className="hero-subhead mx-auto" style={{ maxWidth: '680px' }}>
          TaskFlow is built on security-conscious engineering principles. We rely on strict server-side authorization boundaries, rate limiting, and immutable audit trails rather than cosmetic frontend hiding.
        </p>
      </section>

      {/* ── Security Pillars Grid ── */}
      <section className="py-4 border-top">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <i className="bi bi-shield-lock fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>SEC-01 • RBAC</span>
              </div>
              <h5 className="fw-bold text-body mb-2">Role-Based Access Control (RBAC)</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: 1.65 }}>
                Enforced authoritatively on the backend via Laravel Policies (<code className="text-primary font-monospace">TaskPolicy</code>, <code className="text-primary font-monospace">ProjectPolicy</code>, <code className="text-primary font-monospace">AdminPolicy</code>). Frontend button states are strictly a convenience; unauthorized API requests are intercepted and rejected with <code className="text-danger font-monospace">403 Forbidden</code>.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <i className="bi bi-key fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>SEC-02 • IDOR</span>
              </div>
              <h5 className="fw-bold text-body mb-2">Insecure Direct Object Reference (IDOR) Mitigation</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: 1.65 }}>
                Every task, project, and comment mutation cryptographically verifies user ownership and project membership before execution. A tenant member cannot read or mutate another tenant’s deliverables by guessing primary keys.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <i className="bi bi-clock-history fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>SEC-03 • AUDIT</span>
              </div>
              <h5 className="fw-bold text-body mb-2">Append-Only Immutable Audit Trail</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: 1.65 }}>
                Critical administrative events, role adjustments, status changes, and task deletions are permanently logged in the <code className="text-success font-monospace">audit_logs</code> table with client IP, user agent, actor ID, and JSON attribute deltas. Audit logs lack an <code className="text-muted font-monospace">updated_at</code> column to prevent tampering.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <i className="bi bi-speedometer fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>SEC-04 • DOS DEFENSE</span>
              </div>
              <h5 className="fw-bold text-body mb-2">Adaptive Rate Limiting & Throttling</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: 1.65 }}>
                Public login endpoints are governed by throttle middleware (maximum 5 failed attempts per minute with IP backoff). Internal mutating endpoints prevent automated abuse while keeping legitimate single-page application requests responsive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Specifications ── */}
      <section className="py-5 my-4">
        <div className="pochyaa-card p-4 p-md-5">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h4 className="fw-bold text-body mb-1">Defense & Architecture Specifications</h4>
              <span className="text-secondary small">Standardized security baseline implemented across all tiers:</span>
            </div>
            <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm font-monospace">
              OpenAPI Security Scheme
            </a>
          </div>

          <div className="table-responsive">
            <table className="table table-borderless font-monospace small mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="border-bottom">
                  <th className="text-muted">Control Domain</th>
                  <th className="text-muted">Implementation Mechanism</th>
                  <th className="text-muted">Verification Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-bottom">
                  <td className="text-body fw-bold">Authentication</td>
                  <td className="text-slate-300">Laravel Sanctum Bearer Tokens with Strict Expiry & Revocation</td>
                  <td><span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Verified</span></td>
                </tr>
                <tr className="border-bottom">
                  <td className="text-body fw-bold">SQL Injection</td>
                  <td className="text-slate-300">PDO Prepared Statements via Eloquent ORM; Zero String Concatenation</td>
                  <td><span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Verified</span></td>
                </tr>
                <tr className="border-bottom">
                  <td className="text-body fw-bold">Cross-Site Scripting (XSS)</td>
                  <td className="text-slate-300">React Virtual DOM Auto-Escaping + Laravel HTML-Safe JSON Responses</td>
                  <td><span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Verified</span></td>
                </tr>
                <tr className="border-bottom">
                  <td className="text-body fw-bold">CSRF Protection</td>
                  <td className="text-slate-300">SameSite Cookie Policy + Origin Header Cross-Verification</td>
                  <td><span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Verified</span></td>
                </tr>
                <tr>
                  <td className="text-body fw-bold">Database Indexing</td>
                  <td className="text-slate-300">MySQL B-Tree Covering Indexes on Status, Priority & Foreign Keys</td>
                  <td><span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>0.07ms B-Tree</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Security Bottom CTA ── */}
      <section className="text-center py-5 border-top">
        <h3 className="fw-extrabold text-body mb-2">Have security questions or need an audit review?</h3>
        <p className="text-muted mb-4">Our engineering team welcomes technical security interviews and deep-dives.</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/contact" className="btn-pochyaa-primary">
            <span>Contact Security Team</span>
            <i className="bi bi-arrow-right ms-1"></i>
          </Link>
          <Link to="/login" className="btn-pochyaa-secondary">
            <span>Explore Demo Sandbox</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
