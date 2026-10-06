import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teamSize: '10-50',
    interest: 'demo',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Please complete all required fields', 'danger');
      return;
    }
    setSubmitted(true);
    addToast('Thank you! Your inquiry has been received. Our team will reach out promptly.', 'success');
  };

  return (
    <div className="tf-page-container py-5">
      {/* ── Contact Hero ── */}
      <section className="text-center pt-3 pb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>DIRECT ACCESS</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Engineering & Product Relations</span>
          </div>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '820px' }}>
          Connect with the <span className="text-gradient-blue">TaskFlow engineering team</span>.
        </h1>
        <p className="hero-subhead mx-auto" style={{ maxWidth: '640px' }}>
          Have questions about the architecture, want to schedule a tailored walkthrough, or explore deployment on your own infrastructure? Let’s talk.
        </p>
      </section>

      {/* ── Main Contact & Form Section ── */}
      <section className="pb-5">
        <div className="row g-5 justify-content-center mx-auto" style={{ maxWidth: '1020px' }}>
          {/* Direct Channels */}
          <div className="col-12 col-md-5">
            <div className="pochyaa-card p-4 mb-4">
              <h4 className="fw-bold text-body mb-3">Direct Inquiries</h4>
              <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                TaskFlow is engineered as an open-source, enterprise-grade work management showcase. We welcome technical interviews, engineering discussions, and product reviews.
              </p>

              <div className="d-flex flex-column gap-3 small font-monospace">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <i className="bi bi-github"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body">Source Code</div>
                    <a href="https://github.com/00thirt13n/taskflow" target="_blank" rel="noreferrer" className="text-muted text-decoration-none">
                      github.com/00thirt13n/taskflow
                    </a>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <i className="bi bi-file-earmark-code"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body">API Specification</div>
                    <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="text-muted text-decoration-none">
                      OpenAPI 3.0 Interactive Contract
                    </a>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                    <i className="bi bi-activity"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body">System Health</div>
                    <Link to="/status" className="text-muted text-decoration-none">
                      Live Operational Status (/status)
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="tier-rule-row flex-column align-items-start p-3 mb-4">
              <span className="fw-bold text-body d-block mb-1">Looking for immediate testing?</span>
              <span className="text-muted d-block mb-3">You don’t need to wait for a demo callback. Use our instant one-click login buttons:</span>
              <Link to="/login" className="btn btn-outline-primary btn-sm fw-medium font-monospace w-100">
                Launch 1-Click Persona Demo
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="col-12 col-md-7">
            <div className="pochyaa-card p-4 p-md-5">
              {submitted ? (
                <div className="text-center py-5">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 56, height: 56, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: 24 }}>
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <h4 className="fw-bold text-body mb-2">Inquiry Submitted</h4>
                  <p className="text-secondary small mb-4">
                    Thank you, {formData.name}! Your message has been received. In the meantime, you can explore the live application immediately.
                  </p>
                  <Link to="/login" className="btn-pochyaa-primary">
                    <span>Enter Live Demo Now</span>
                    <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h5 className="fw-bold text-body mb-3">Schedule Walkthrough / Inquiry</h5>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Your Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Work Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. maya@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Team Size</label>
                      <select
                        className="form-select"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      >
                        <option value="1-10">1-10 engineers</option>
                        <option value="10-50">10-50 engineers</option>
                        <option value="50+">50+ engineers</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Primary Interest</label>
                      <select
                        className="form-select"
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      >
                        <option value="demo">Product Walkthrough</option>
                        <option value="technical">Technical Architecture Review</option>
                        <option value="hiring">Hiring / Evaluation</option>
                        <option value="self-host">Self-Hosted Deployment</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">Message / Context</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Tell us what you'd like to discuss or evaluate..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-pochyaa-primary w-100">
                    <span>Submit Inquiry</span>
                    <i className="bi bi-send ms-1"></i>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
