import React from 'react';
import { Link } from 'react-router-dom';

export default function SolutionsPage() {
  return (
    <div className="tf-page-container py-5">
      {/* ── Solutions Hero ── */}
      <section className="text-center pt-3 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>CROSS-FUNCTIONAL SOLUTIONS</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Unified Team Alignment</span>
          </div>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '880px' }}>
          Tailored for <span className="text-gradient-blue">high-velocity engineering squads</span>.
        </h1>
        <p className="hero-subhead mx-auto" style={{ maxWidth: '680px' }}>
          Discover how TaskFlow adapts to engineering leads, product managers, DevOps operators, and executive leaders to eliminate context fragmentation.
        </p>
      </section>

      {/* ── Solutions Grid ── */}
      <section className="py-4 border-top">
        <div className="row g-4">
          {/* Engineering */}
          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <i className="bi bi-code-slash fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>FOR SQUADS</span>
              </div>
              <h4 className="fw-bold text-body mb-2">For Engineering Teams</h4>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                Ship releases predictably with technical clarity. Track bug fixes, refactoring, and sprint deliverables without drowning in administrative clutter.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Fast task creation with Command Palette (Ctrl+K or /)</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Explicit blocker flags and dependency tracking</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Sub-0.09 ms query speed for instant filtering across large backlogs</span></li>
              </ul>
            </div>
          </div>

          {/* Product */}
          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                  <i className="bi bi-kanban fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#0891b2' }}>FOR PRODUCT</span>
              </div>
              <h4 className="fw-bold text-body mb-2">For Product Managers</h4>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                Keep stakeholders and engineers aligned on delivery dates, feature requirements, and customer-facing milestones.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Visual Gantt-style Timeline and monthly calendar view</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Project health status (Healthy, At Risk, Delayed)</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Grounded AI assistant for generating acceptance criteria</span></li>
              </ul>
            </div>
          </div>

          {/* Operations & DevOps */}
          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <i className="bi bi-shield-check fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>FOR SRE / OPS</span>
              </div>
              <h4 className="fw-bold text-body mb-2">For DevOps & Operations</h4>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                Enforce change boundaries, maintain audit-ready records of production deployments, and isolate work items per service.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-warning fw-bold"></i> <span className="text-slate-300">Immutable audit log documenting actor ID and IP addresses</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-warning fw-bold"></i> <span className="text-slate-300">Role-based access separating standard members from administrators</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-warning fw-bold"></i> <span className="text-slate-300">Standardized REST API with complete OpenAPI schema</span></li>
              </ul>
            </div>
          </div>

          {/* Executive Leadership */}
          <div className="col-12 col-md-6">
            <div className="pochyaa-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <i className="bi bi-graph-up-arrow fs-5"></i>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>FOR LEADERSHIP</span>
              </div>
              <h4 className="fw-bold text-body mb-2">For Engineering Leadership</h4>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                Gain high-fidelity visibility into team throughput, bottleneck clusters, and cross-project milestone velocity.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Executive dashboard displaying real-time priority distribution</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Cross-project milestone completion tracking</span></li>
                <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Instant CSV and JSON export for reporting and analysis</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solutions Bottom CTA ── */}
      <section className="text-center py-5 border-top">
        <h3 className="fw-extrabold text-body mb-2">Experience TaskFlow in action.</h3>
        <p className="text-muted mb-4">Try the interactive sandbox with pre-loaded team data today.</p>
        <Link to="/login" className="btn-pochyaa-primary">
          <span>Explore Interactive Demo</span>
          <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </section>
    </div>
  );
}
