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
    <div className="py-4">
      <section className="text-center py-5">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-3">
          Get in Touch
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '780px' }}>
          Connect with the TaskFlow team.
        </h1>
        <p className="hero-subhead">
          Have questions about the architecture, want to schedule a tailored walkthrough, or explore deployment on your own infrastructure? Let’s talk.
        </p>
      </section>

      <section className="pb-5">
        <div className="row g-5 justify-content-center mx-auto" style={{ maxWidth: '960px' }}>
          <div className="col-12 col-md-5">
            <h4 className="fw-bold text-body mb-3">Direct Inquiries</h4>
            <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
              TaskFlow is engineered as an open-source, enterprise-grade work management showcase. We welcome technical interviews, engineering discussions, and product reviews.
            </p>

            <div className="d-flex flex-column gap-3 small mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle" style={{ width: 36, height: 36, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                  <i className="bi bi-github"></i>
                </div>
                <div>
                  <div className="fw-bold text-body">Source Code</div>
                  <a href="https://github.com/00thirt13n/taskflow" target="_blank" rel="noreferrer" className="text-muted">
                    github.com/00thirt13n/taskflow
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle" style={{ width: 36, height: 36, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <i className="bi bi-file-earmark-code"></i>
                </div>
                <div>
                  <div className="fw-bold text-body">API Specification</div>
                  <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="text-muted">
                    OpenAPI 3.0 Interactive Contract
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle" style={{ width: 36, height: 36, backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                  <i className="bi bi-activity"></i>
                </div>
                <div>
                  <div className="fw-bold text-body">System Health</div>
                  <Link to="/status" className="text-muted">
                    Live Operational Status (/status)
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded bg-subtle small">
              <span className="fw-bold text-body d-block mb-1">Looking for immediate testing?</span>
              <span className="text-muted d-block mb-2">You don’t need to wait for a demo callback. Use our instant one-click login buttons:</span>
              <Link to="/login" className="btn btn-outline-primary btn-sm fw-medium">
                Launch 1-Click Persona Demo
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="tf-card p-4 shadow-sm border">
              {submitted ? (
                <div className="text-center py-5">
                  <div className="avatar-circle mx-auto mb-3" style={{ width: 56, height: 56, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 24 }}>
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <h4 className="fw-bold text-body mb-2">Inquiry Submitted</h4>
                  <p className="text-muted small mb-4">
                    Thank you, {formData.name}! Your message has been logged. In the meantime, you can explore the live application immediately.
                  </p>
                  <Link to="/login" className="btn btn-primary">
                    Enter Live Demo Now
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h5 className="fw-bold text-body mb-3">Schedule Walkthrough / Inquiry</h5>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-body">Your Name *</label>
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
                    <label className="form-label small fw-semibold text-body">Work Email *</label>
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
                      <label className="form-label small fw-semibold text-body">Team Size</label>
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
                      <label className="form-label small fw-semibold text-body">Primary Interest</label>
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
                    <label className="form-label small fw-semibold text-body">Message / Context</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Tell us what you'd like to discuss or evaluate..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 fw-semibold py-2">
                    Submit Inquiry <i className="bi bi-send ms-1"></i>
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
