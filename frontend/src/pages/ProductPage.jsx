import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductPage() {
  return (
    <div className="py-4">
      {/* Product Hero */}
      <section className="text-center py-5">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-3">
          Product Capabilities
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '800px' }}>
          One platform to plan, execute, and deliver.
        </h1>
        <p className="hero-subhead">
          TaskFlow combines structured project hierarchies with flexible multi-views, giving technical teams the exact perspective they need at every stage of execution.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/login" className="btn btn-primary btn-lg px-4">
            Try in Live Demo <i className="bi bi-arrow-right ms-1"></i>
          </Link>
          <Link to="/security" className="btn btn-outline-secondary btn-lg px-4">
            Security Architecture
          </Link>
        </div>
      </section>

      {/* Feature Pillar 1: PLAN */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <span className="text-primary fw-bold small text-uppercase tracking-wider">01. Plan & Schedule</span>
            <h2 className="fw-bold text-body mt-2 mb-3">Map projects, milestones, and delivery windows</h2>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>
              Organize complex software initiatives into high-level milestones and visual Gantt-style timeline schedules. View delivery dependencies, track start and target dates, and spot scheduling bottlenecks before release week.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Monthly calendar grid visualizing task due dates and milestones</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Timeline view with delivery progress and dependency highlights</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Calculated project health scoring: Healthy, At Risk, or Delayed</li>
            </ul>
          </div>
          <div className="col-12 col-lg-6">
            <div className="tf-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-body">Gantt Delivery Schedule</span>
                <span className="badge bg-success bg-opacity-10 text-success">Healthy (88%)</span>
              </div>
              <div className="d-flex flex-column gap-3 small">
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium text-body">Customer Portal v2 Ingress</span>
                    <span className="text-muted">Oct 20 → Nov 15</span>
                  </div>
                  <div className="progress" style={{ height: '14px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '75%' }}>75%</div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-medium text-body">Platform Reliability & Database Indexing</span>
                    <span className="text-muted">Oct 15 → Nov 05</span>
                  </div>
                  <div className="progress" style={{ height: '14px' }}>
                    <div className="progress-bar bg-success" style={{ width: '100%' }}>100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar 2: EXECUTE */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5 flex-lg-row-reverse">
          <div className="col-12 col-lg-6">
            <span className="text-primary fw-bold small text-uppercase tracking-wider">02. Execute & Triage</span>
            <h2 className="fw-bold text-body mt-2 mb-3">Interactive multi-views with fluid drag-and-drop</h2>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>
              Whether you prefer dense, spreadsheet-style tables or visual drag-and-drop Kanban swimlanes, TaskFlow keeps your team aligned. Status updates persist instantly via REST APIs with optimistic UI rollback on network error.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> 5 Kanban columns: Backlog, Todo, In Progress, Review, and Done</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Compact table view with bulk selection toolbar and batch operations</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Sub-0.09 ms MySQL B-Tree indexing on status and priority filters</li>
            </ul>
          </div>
          <div className="col-12 col-lg-6">
            <div className="tf-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-body">Kanban Swimlanes Preview</span>
                <span className="badge bg-primary text-white">PORT Sprint</span>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <div className="p-2 border rounded bg-subtle">
                    <div className="text-muted small fw-bold text-uppercase mb-2">In Progress (2)</div>
                    <div className="kanban-card p-2 mb-2">
                      <div className="font-monospace text-primary small fw-bold">PORT-101</div>
                      <div className="small fw-medium text-body">OAuth2 Google flow</div>
                      <span className="badge bg-danger bg-opacity-10 text-danger mt-1">High</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 border rounded bg-subtle">
                    <div className="text-muted small fw-bold text-uppercase mb-2">Done (3)</div>
                    <div className="kanban-card p-2 mb-2 opacity-75">
                      <div className="font-monospace text-muted small fw-bold">PORT-100</div>
                      <div className="small text-decoration-line-through text-muted">Schema migration</div>
                      <span className="badge bg-success bg-opacity-10 text-success mt-1">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar 3: COLLABORATE & GROUNDED AI */}
      <section className="py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <span className="text-primary fw-bold small text-uppercase tracking-wider">03. Collaborate in Context</span>
            <h2 className="fw-bold text-body mt-2 mb-3">Slide-over drawer, checklist subtasks, and audit trail</h2>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>
              Inspect work items without losing your position on the board. The slide-over detail drawer offers quick status pickers, subtask checklists with completion counts (e.g. 3/4 completed), explicit blocker flags with reasons, and an immutable activity timeline.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Discussion comments feed with author permissions</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Blocker toggle with reason explanation</li>
              <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Grounded AI assistant for natural language task drafts and subtasks</li>
            </ul>
          </div>
          <div className="col-12 col-lg-6">
            <div className="tf-card p-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="font-monospace text-primary fw-bold">PORT-101</span>
                <span className="badge bg-danger bg-opacity-10 text-danger">High Priority</span>
              </div>
              <h6 className="fw-bold text-body">Implement OAuth2 authentication flow</h6>
              <div className="border-top pt-2 mt-2">
                <span className="text-muted small fw-bold">Subtasks Checklist (2 / 3 Complete)</span>
                <div className="d-flex flex-column gap-1 mt-2 small">
                  <div><i className="bi bi-check-circle-fill text-success me-1"></i> Register Google OAuth credentials</div>
                  <div><i className="bi bi-check-circle-fill text-success me-1"></i> Implement redirect and callback routes</div>
                  <div><i className="bi bi-circle text-muted me-1"></i> Write automated test suite assertions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-5 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <h3 className="fw-bold text-body mb-3">Ready to explore TaskFlow?</h3>
        <Link to="/login" className="btn btn-primary btn-lg px-4">
          Launch Live Demo
        </Link>
      </section>
    </div>
  );
}
