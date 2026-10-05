import React from 'react';
import { Link } from 'react-router-dom';

export default function SolutionsPage() {
  return (
    <div className="py-4">
      {/* Solutions Hero */}
      <section className="text-center py-5">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-3">
          Solutions by Role
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '820px' }}>
          Tailored for high-velocity software teams.
        </h1>
        <p className="hero-subhead">
          Discover how TaskFlow adapts to engineering leads, product managers, DevOps operators, and executive leaders to eliminate context fragmentation.
        </p>
      </section>

      {/* Solutions Grid */}
      <section className="py-4 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row g-4">
          {/* Engineering */}
          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <i className="bi bi-code-slash"></i>
              </div>
              <h4 className="fw-bold text-body mb-2">For Engineering Teams</h4>
              <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                Ship releases predictably with technical clarity. Track bug fixes, refactoring, and sprint deliverables without drowning in administrative clutter.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted">
                <li><i className="bi bi-check-lg text-primary me-2"></i> Fast task creation with Command Palette (Ctrl+K or /)</li>
                <li><i className="bi bi-check-lg text-primary me-2"></i> Explicit blocker flags and dependency tracking</li>
                <li><i className="bi bi-check-lg text-primary me-2"></i> Sub-0.09 ms query speed for instant filtering across large backlogs</li>
              </ul>
            </div>
          </div>

          {/* Product */}
          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                <i className="bi bi-kanban"></i>
              </div>
              <h4 className="fw-bold text-body mb-2">For Product Managers</h4>
              <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                Keep stakeholders and engineers aligned on delivery dates, feature requirements, and customer-facing milestones.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted">
                <li><i className="bi bi-check-lg text-info me-2"></i> Visual Gantt-style Timeline and monthly calendar view</li>
                <li><i className="bi bi-check-lg text-info me-2"></i> Project health status (Healthy, At Risk, Delayed)</li>
                <li><i className="bi bi-check-lg text-info me-2"></i> Grounded AI assistant for generating acceptance criteria and subtasks</li>
              </ul>
            </div>
          </div>

          {/* Operations */}
          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <h4 className="fw-bold text-body mb-2">For DevOps & Operations</h4>
              <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                Manage infrastructure migrations, compliance audits, and recurring operational reviews with full audit traceability.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted">
                <li><i className="bi bi-check-lg text-warning me-2"></i> Append-only immutable audit logs with before/after state diffs</li>
                <li><i className="bi bi-check-lg text-warning me-2"></i> Live system diagnostics (/api/admin/system-health)</li>
                <li><i className="bi bi-check-lg text-warning me-2"></i> Rate-limited REST APIs and zero plaintext credential leakage</li>
              </ul>
            </div>
          </div>

          {/* Leaders */}
          <div className="col-12 col-md-6">
            <div className="feature-card-commercial">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <h4 className="fw-bold text-body mb-2">For Engineering Leaders & CTOs</h4>
              <p className="text-muted small mb-3" style={{ lineHeight: 1.6 }}>
                Understand cross-project velocity, team workload balance, and delivery bottlenecks from an executive cockpit.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted">
                <li><i className="bi bi-check-lg text-success me-2"></i> 7-day velocity net completion trends and throughput reporting</li>
                <li><i className="bi bi-check-lg text-success me-2"></i> Team workload distribution to prevent burnout</li>
                <li><i className="bi bi-check-lg text-success me-2"></i> High-performance streaming CSV export for leadership syncs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-5 border-top my-4" style={{ borderColor: 'var(--tf-border)' }}>
        <h3 className="fw-bold text-body mb-2">Experience the difference in your team</h3>
        <p className="text-muted mb-4">No setup required. Explore with one-click demo personas immediately.</p>
        <Link to="/login" className="btn btn-primary btn-lg px-4">
          Launch Live Demo <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </section>
    </div>
  );
}
