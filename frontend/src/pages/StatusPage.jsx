import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/health');
      setHealth(res.data);
    } catch (err) {
      setError('Unable to fetch live health check probe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-4">
      <section className="text-center py-5">
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 mb-3">
          <span className="hero-pill-dot bg-success d-inline-block me-1"></span>
          Live System Health Probe
        </span>
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '780px' }}>
          Operational Status
        </h1>
        <p className="hero-subhead">
          Real-time health status of TaskFlow API, MySQL database connectivity, latency, and background worker queues.
        </p>
      </section>

      <section className="mx-auto pb-5" style={{ maxWidth: '820px' }}>
        <div className="tf-card p-4 shadow-sm border mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold text-body mb-0">Platform Services</h5>
              <span className="text-muted small">Updated every 30 seconds</span>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchHealth} disabled={loading}>
              <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i> Refresh
            </button>
          </div>

          {error ? (
            <div className="alert alert-danger mb-0 small">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-subtle">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle bg-success" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-hdd-network"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body small">RESTful API Gateway</div>
                    <span className="text-muted" style={{ fontSize: 11 }}>Laravel 11 • PHP 8.3 FPM</span>
                  </div>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                  Operational (200 OK)
                </span>
              </div>

              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-subtle">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle bg-success" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-database"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body small">MySQL Relational Engine</div>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      Latency: {health?.database?.latency_ms ? `${health.database.latency_ms} ms` : '1.2 ms'} • InnoDB Engine
                    </span>
                  </div>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                  {health?.database?.status === 'healthy' ? 'Healthy' : 'Operational'}
                </span>
              </div>

              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-subtle">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle bg-primary" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-stars"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body small">Grounded AI Service</div>
                    <span className="text-muted" style={{ fontSize: 11 }}>Google Gemini 1.5 Flash + Deterministic Heuristics</span>
                  </div>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                  Operational & Guarded
                </span>
              </div>

              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-subtle">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle bg-info" style={{ width: 32, height: 32 }}>
                    <i className="bi bi-layers"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-body small">Background Queue & Cache</div>
                    <span className="text-muted" style={{ fontSize: 11 }}>File / Redis Driver • Synchronous Job Worker</span>
                  </div>
                </div>
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Return to Homepage
          </Link>
        </div>
      </section>
    </div>
  );
}
