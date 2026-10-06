import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductPage() {
  return (
    <div className="tf-page-container py-5">
      {/* ── Product Hero ── */}
      <section className="text-center pt-3 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>CAPABILITIES & ARCHITECTURE</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Deterministic Work Management</span>
          </div>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '880px' }}>
          One connected platform to plan, execute, <span className="text-gradient-blue">and deliver with precision</span>.
        </h1>
        <p className="hero-subhead mx-auto" style={{ maxWidth: '680px' }}>
          TaskFlow combines structured project hierarchies with flexible multi-views, giving technical teams the exact perspective they need at every stage of execution.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <Link to="/login" className="btn-pochyaa-primary">
            <span>Launch Interactive Demo</span>
            <i className="bi bi-arrow-right ms-1"></i>
          </Link>
          <Link to="/security" className="btn-pochyaa-secondary">
            <i className="bi bi-shield-check text-primary me-1"></i>
            <span>Security Architecture</span>
          </Link>
        </div>
      </section>

      {/* ── Feature Pillar 1: PLAN ── */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <div className="font-monospace text-uppercase fw-bold text-primary small mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              TIER 1 • PLANNING & SCHEDULING
            </div>
            <h2 className="fw-extrabold text-body mb-3" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              Map projects, milestones, and delivery windows
            </h2>
            <p className="text-muted" style={{ lineHeight: 1.65, fontSize: '1rem' }}>
              Organize complex software initiatives into high-level milestones and visual Gantt-style timeline schedules. View delivery dependencies, track start and target dates, and spot scheduling bottlenecks before release week.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small font-monospace mt-4">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Monthly calendar grid visualizing task due dates and milestones</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Timeline view with delivery progress and dependency highlights</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Calculated project health scoring: Healthy, At Risk, or Delayed</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-lg-6">
            <div className="pochyaa-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--tf-border)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-steps text-primary"></i>
                  <span className="fw-bold text-body font-monospace small">Gantt Delivery Schedule</span>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  Healthy (88%)
                </span>
              </div>
              <div className="d-flex flex-column gap-3 small font-monospace">
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium text-body">Customer Portal v2 Ingress</span>
                    <span className="text-muted">Oct 20 → Nov 15</span>
                  </div>
                  <div className="progress" style={{ height: '10px', background: 'var(--tf-bg-subtle, rgba(148, 163, 184, 0.2))', borderRadius: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '75%', borderRadius: '6px' }}>75%</div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium text-body">Platform Reliability & Database Indexing</span>
                    <span className="text-muted">Oct 15 → Nov 05</span>
                  </div>
                  <div className="progress" style={{ height: '10px', background: 'var(--tf-bg-subtle, rgba(148, 163, 184, 0.2))', borderRadius: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '100%', borderRadius: '6px' }}>100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Pillar 2: EXECUTE ── */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5 flex-lg-row-reverse">
          <div className="col-12 col-lg-6">
            <div className="font-monospace text-uppercase fw-bold text-primary small mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              TIER 2 • EXECUTION & MULTI-VIEWS
            </div>
            <h2 className="fw-extrabold text-body mb-3" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              Interactive multi-views with fluid drag-and-drop
            </h2>
            <p className="text-muted" style={{ lineHeight: 1.65, fontSize: '1rem' }}>
              Whether you prefer dense, spreadsheet-style tables or visual drag-and-drop Kanban swimlanes, TaskFlow keeps your team aligned. Status updates persist instantly via REST APIs with optimistic UI rollback on network error.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small font-monospace mt-4">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">5 Kanban columns: Backlog, Todo, In Progress, Review, and Done</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Compact table view with bulk selection toolbar and batch operations</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Sub-0.09 ms MySQL B-Tree indexing on status and priority filters</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-lg-6">
            <div className="pochyaa-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--tf-border)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-kanban text-primary"></i>
                  <span className="fw-bold text-body font-monospace small">Kanban Swimlanes Preview</span>
                </div>
                <span className="badge font-monospace" style={{ background: '#2563eb', color: '#fff' }}>PORT Sprint</span>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <div className="tier-rule-row p-3 rounded-3 d-block">
                    <div className="text-muted small fw-semibold font-monospace mb-2">In progress (2)</div>
                    <div className="ai-inner-box p-2 rounded-2 mb-2">
                      <div className="text-primary small fw-semibold font-monospace">PORT-101</div>
                      <div className="small fw-medium text-body">OAuth2 Google flow</div>
                      <span className="badge bg-danger bg-opacity-20 text-danger mt-1 font-monospace" style={{ fontSize: '10px' }}>High</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="tier-rule-row p-3 rounded-3 d-block">
                    <div className="text-muted small fw-semibold font-monospace mb-2">Done (3)</div>
                    <div className="ai-inner-box p-2 rounded-2 mb-2 opacity-75">
                      <div className="text-muted small fw-semibold font-monospace">PORT-100</div>
                      <div className="small text-decoration-line-through text-muted">Schema migration</div>
                      <span className="badge bg-success bg-opacity-20 text-success mt-1 font-monospace" style={{ fontSize: '10px' }}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Pillar 3: COLLABORATE & GROUNDED AI ── */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <div className="font-monospace text-uppercase fw-bold text-primary small mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              TIER 3 • CONTEXT & COLLABORATION
            </div>
            <h2 className="fw-extrabold text-body mb-3" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              Slide-over drawer, checklist subtasks, and audit trail
            </h2>
            <p className="text-muted" style={{ lineHeight: 1.65, fontSize: '1rem' }}>
              Inspect work items without losing your position on the board. The slide-over detail drawer offers quick status pickers, subtask checklists with completion counts, explicit blocker flags with reasons, and an immutable activity timeline.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small font-monospace mt-4">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Discussion comments feed with author permissions</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Blocker toggle with mandatory reason explanation</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check2 text-primary fw-bold"></i>
                <span className="text-slate-300">Grounded AI assistant for natural language task drafts and subtasks</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-lg-6">
            <div className="pochyaa-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom font-monospace small" style={{ borderColor: 'var(--tf-border)' }}>
                <span className="text-primary fw-semibold">PORT-101</span>
                <span className="badge bg-danger bg-opacity-20 text-danger">High Priority</span>
              </div>
              <h6 className="fw-bold text-body mb-3">Implement OAuth2 authentication flow</h6>
              <div className="tier-rule-row p-3 rounded-3 d-block">
                <span className="text-muted small fw-bold font-monospace">Subtasks Checklist (2 / 3 Complete)</span>
                <div className="d-flex flex-column gap-2 mt-2 small font-monospace">
                  <div className="text-slate-300"><i className="bi bi-check-circle-fill text-success me-2"></i> Register Google OAuth credentials</div>
                  <div className="text-slate-300"><i className="bi bi-check-circle-fill text-success me-2"></i> Implement redirect and callback routes</div>
                  <div className="text-muted"><i className="bi bi-circle text-muted me-2"></i> Write automated test suite assertions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="text-center py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <h3 className="fw-extrabold text-body mb-3" style={{ fontSize: '2rem' }}>Ready to explore TaskFlow?</h3>
        <p className="text-muted mb-4">Deploy the interactive work management engine in one click.</p>
        <Link to="/login" className="btn-pochyaa-primary">
          <span>Launch Interactive Demo</span>
          <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </section>
    </div>
  );
}
