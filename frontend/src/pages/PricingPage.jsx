import React from 'react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  return (
    <div className="tf-page-container py-5">
      {/* ── Pricing Hero ── */}
      <section className="text-center pt-3 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>TRANSPARENT VALUE ARCHITECTURE</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Zero Hidden Fees</span>
          </div>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '880px' }}>
          Predictable pricing for <span className="text-gradient-blue">high-velocity engineering</span>.
        </h1>
        <p className="hero-subhead mx-auto" style={{ maxWidth: '680px' }}>
          Explore the live platform today in the free demonstration environment, or preview our commercial team tiers.
        </p>
      </section>

      {/* ── Pricing Cards Grid ── */}
      <section className="py-4 border-top">
        <div className="row g-4 justify-content-center">
          {/* Community & Demo Tier (Featured) */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between" style={{ border: '1px solid rgba(59, 130, 246, 0.5)', boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.2)' }}>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-primary font-monospace small">Live Portfolio Demo</span>
                  <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Active Now</span>
                </div>
                <h3 className="fw-bold text-body mb-1">Community Demo</h3>
                <div className="d-flex align-items-baseline gap-1 my-3">
                  <span className="fs-1 fw-bold text-body font-monospace">$0</span>
                  <span className="text-muted small font-monospace">/ free exploration</span>
                </div>
                <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                  Full access to the live demonstration environment seeded with Northstar Engineering workspace data.
                </p>

                <Link to="/login" className="btn-pochyaa-primary w-100 mb-4 text-center">
                  <span>Launch Interactive Demo</span>
                  <i className="bi bi-arrow-right ms-1"></i>
                </Link>

                <div className="border-top pt-3">
                  <span className="small fw-bold text-body font-monospace d-block mb-2">Included Capabilities:</span>
                  <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">4-Tier Workspace & Project Hierarchy</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Interactive Table, Kanban, and Timeline</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Slide-over Detail Drawer & Subtasks</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Grounded AI Task Decomposer</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Admin User Roster & Immutable Audit Logs</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-success fw-bold"></i> <span className="text-slate-300">Sub-0.09 ms MySQL B-Tree Performance</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Team Workspace Tier */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-muted font-monospace small">Team Edition</span>
                  <span className="badge font-monospace" style={{ background: 'rgba(51, 65, 85, 0.2)', color: 'var(--tf-text-secondary)' }}>Preview</span>
                </div>
                <h3 className="fw-bold text-body mb-1">Team Workspace</h3>
                <div className="d-flex align-items-baseline gap-1 my-3">
                  <span className="fs-1 fw-bold text-body font-monospace">$12</span>
                  <span className="text-muted small font-monospace">/ user / month</span>
                </div>
                <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                  Built for engineering squads requiring isolated workspaces, custom milestones, and continuous delivery gates.
                </p>

                <Link to="/contact" className="btn btn-outline-secondary w-100 fw-semibold mb-4 py-2" style={{ borderRadius: '0.75rem' }}>
                  Contact for Early Access
                </Link>

                <div className="border-top pt-3">
                  <span className="small fw-bold text-body font-monospace d-block mb-2">Everything in Demo, plus:</span>
                  <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Unlimited Projects and Milestones</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Custom Role & Permission Matrix</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Automated Webhook & Slack Integrations</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">30-day Immutable Audit Log Retention</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-primary fw-bold"></i> <span className="text-slate-300">Priority Support SLA</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Self-Hosted Tier */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-info font-monospace small">Self-Hosted</span>
                  <span className="badge font-monospace" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#0891b2' }}>Custom</span>
                </div>
                <h3 className="fw-bold text-body mb-1">Enterprise Appliance</h3>
                <div className="d-flex align-items-baseline gap-1 my-3">
                  <span className="fs-1 fw-bold text-body font-monospace">$29</span>
                  <span className="text-muted small font-monospace">/ user / month</span>
                </div>
                <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                  Deploy on your own AWS, GCP, or on-premise Docker/Kubernetes infrastructure with full database sovereignty.
                </p>

                <Link to="/contact" className="btn btn-outline-secondary w-100 fw-semibold mb-4 py-2" style={{ borderRadius: '0.75rem' }}>
                  Request Enterprise Architecture
                </Link>

                <div className="border-top pt-3">
                  <span className="small fw-bold text-body font-monospace d-block mb-2">Enterprise Controls:</span>
                  <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary font-monospace mb-0">
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Docker & Kubernetes Helm Charts</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">SAML 2.0 / Okta / Azure AD Single Sign-On</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Air-Gapped & Offline Deployment</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Indefinite Immutable Audit Log Retention</span></li>
                    <li className="d-flex align-items-center gap-2"><i className="bi bi-check2 text-info fw-bold"></i> <span className="text-slate-300">Dedicated Engineering Account Manager</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Bottom CTA ── */}
      <section className="text-center py-5 border-top">
        <h3 className="fw-extrabold text-body mb-2">Want to test the full feature set right now?</h3>
        <p className="text-muted mb-4">No registration or credit card required. One click enters the live sandbox.</p>
        <Link to="/login" className="btn-pochyaa-primary">
          <span>Enter Live Workspace Sandbox</span>
          <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </section>
    </div>
  );
}
