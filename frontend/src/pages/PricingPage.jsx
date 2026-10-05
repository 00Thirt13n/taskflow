import React from 'react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  return (
    <div className="py-4">
      {/* Pricing Hero */}
      <section className="text-center py-5">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-3">
          Transparent Editions
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '820px' }}>
          Predictable pricing for growing teams.
        </h1>
        <p className="hero-subhead">
          Explore the live platform today in the free demonstration environment, or preview our commercial team tiers.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-4 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="row g-4 justify-content-center">
          {/* Community & Demo Tier */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pricing-tier-card featured">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-primary small text-uppercase">Live Portfolio Demo</span>
                <span className="badge bg-success bg-opacity-10 text-success">Active Now</span>
              </div>
              <h3 className="fw-bold text-body mb-1">Community Demo</h3>
              <div className="d-flex align-items-baseline gap-1 my-3">
                <span className="fs-1 fw-bold text-body">$0</span>
                <span className="text-muted small">/ free exploration</span>
              </div>
              <p className="text-muted small mb-4">
                Full access to the live demonstration environment seeded with Northstar Engineering workspace data.
              </p>

              <Link to="/login" className="btn btn-primary w-100 fw-semibold mb-4">
                Launch Live Demo <i className="bi bi-arrow-right ms-1"></i>
              </Link>

              <div className="border-top pt-3">
                <span className="small fw-bold text-body d-block mb-2">Included Capabilities:</span>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-muted mb-0">
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> 4-Tier Workspace & Project Hierarchy</li>
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> Interactive Table, Kanban, Calendar, and Timeline</li>
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> Slide-over Task Detail Drawer & Subtasks</li>
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> Grounded AI Natural Language Parser</li>
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> Admin User Management & Audit Logs</li>
                  <li><i className="bi bi-check2 text-success me-2 fw-bold"></i> Sub-0.09 ms MySQL B-Tree Performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Team Workspace Tier */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pricing-tier-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-muted small text-uppercase">Team Edition</span>
                <span className="badge bg-secondary bg-opacity-10 text-muted">Preview</span>
              </div>
              <h3 className="fw-bold text-body mb-1">Team Workspace</h3>
              <div className="d-flex align-items-baseline gap-1 my-3">
                <span className="fs-1 fw-bold text-body">$12</span>
                <span className="text-muted small">/ member / month</span>
              </div>
              <p className="text-muted small mb-4">
                Dedicated multi-tenant workspace with isolated databases and custom domain branding.
              </p>

              <Link to="/contact" className="btn btn-outline-secondary w-100 fw-medium mb-4">
                Request Early Access
              </Link>

              <div className="border-top pt-3">
                <span className="small fw-bold text-body d-block mb-2">Everything in Community, plus:</span>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-muted mb-0">
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Unlimited Workspaces & Projects</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Custom Domain (taskflow.yourdomain.com)</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Dedicated Redis Cache & Queue Workers</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Automated Daily MySQL Database Snapshots</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Webhook Event Integrations (Slack / GitHub)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enterprise Cloud Tier */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="pricing-tier-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-muted small text-uppercase">Enterprise</span>
                <span className="badge bg-secondary bg-opacity-10 text-muted">Roadmap</span>
              </div>
              <h3 className="fw-bold text-body mb-1">Enterprise Cloud</h3>
              <div className="d-flex align-items-baseline gap-1 my-3">
                <span className="fs-1 fw-bold text-body">Custom</span>
              </div>
              <p className="text-muted small mb-4">
                Air-gapped on-premises deployment, SAML 2.0 / Okta SSO, and dedicated MySQL read replicas.
              </p>

              <Link to="/contact" className="btn btn-outline-secondary w-100 fw-medium mb-4">
                Contact Engineering
              </Link>

              <div className="border-top pt-3">
                <span className="small fw-bold text-body d-block mb-2">Enterprise Infrastructure:</span>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-muted mb-0">
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Self-Hosted Docker / Kubernetes Helm Charts</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> SAML 2.0 / Okta / Azure AD SSO Integration</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> MySQL Read Replicas & High Availability</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> 99.9% Uptime Service Level Agreement</li>
                  <li><i className="bi bi-check2 text-primary me-2 fw-bold"></i> Custom Security Compliance Auditing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent FAQ */}
      <section className="py-5 border-top my-3" style={{ borderColor: 'var(--tf-border)' }}>
        <h3 className="fw-bold text-body text-center mb-4">Frequently Asked Questions</h3>
        <div className="row g-4 mx-auto" style={{ maxWidth: '840px' }}>
          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-body">Is the Community Demo really free?</h6>
            <p className="text-muted small">
              Yes! The demo environment is hosted live and seeded with realistic engineering projects so recruiters, engineering managers, and clients can explore all features freely.
            </p>
          </div>
          <div className="col-12 col-md-6">
            <h6 className="fw-bold text-body">How is data isolated between users?</h6>
            <p className="text-muted small">
              Data isolation is enforced strictly on the server side using Laravel Policies and scoped Eloquent relations. Cross-tenant reads and mutations are intercepted and return <code>403 Forbidden</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
