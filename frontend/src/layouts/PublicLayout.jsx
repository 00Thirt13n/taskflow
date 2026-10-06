import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TaskFlowLogo from '../components/TaskFlowLogo';
import ParticleCanvas from '../components/ParticleCanvas';

export default function PublicLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100 position-relative" style={{ backgroundColor: 'var(--tf-bg-main)', overflowX: 'hidden' }}>
      {/* ── Pochyaa-Style Particle Constellation Canvas ── */}
      <ParticleCanvas />

      {/* ── Subtle Ambient Mesh Glows ── */}
      <div className="position-fixed top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <div className="ambient-glow-top"></div>
        <div className="ambient-glow-left"></div>
        <div className="ambient-glow-right"></div>
      </div>

      {/* ── Sticky Navigation Header ── */}
      <header className="marketing-header py-3 px-3">
        <div className="container-xl d-flex align-items-center justify-content-between">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <TaskFlowLogo size="md" showWordmark={false} />
            <div className="d-none d-sm-block">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-extrabold tracking-tight" style={{ fontSize: '1.05rem', color: 'var(--tf-text-main)' }}>TaskFlow</span>
                <span
                  className="font-monospace fw-bold text-uppercase"
                  style={{
                    fontSize: '9px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: 'rgba(20, 184, 166, 0.15)',
                    color: '#2dd4bf',
                    border: '1px solid rgba(20, 184, 166, 0.35)',
                    letterSpacing: '0.06em',
                  }}
                >
                  BETA
                </span>
              </div>
              <span className="d-block text-muted" style={{ fontSize: '11px', marginTop: '-2px' }}>
                Plan, execute, and deliver with zero drift.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-md-flex align-items-center gap-1">
            <Link to="/product" className={`marketing-nav-link ${isActive('/product') ? 'active' : ''}`}>
              Capabilities
            </Link>
            <Link to="/solutions" className={`marketing-nav-link ${isActive('/solutions') ? 'active' : ''}`}>
              Solutions
            </Link>
            <Link to="/security" className={`marketing-nav-link ${isActive('/security') ? 'active' : ''}`}>
              Security & Trust
            </Link>
            <Link to="/pricing" className={`marketing-nav-link ${isActive('/pricing') ? 'active' : ''}`}>
              Pricing
            </Link>
            <Link to="/contact" className={`marketing-nav-link ${isActive('/contact') ? 'active' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Actions & Persona Access */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm p-1 d-flex align-items-center justify-content-center rounded-circle border"
              style={{ width: 34, height: 34, backgroundColor: 'var(--tf-bg-surface)', borderColor: 'var(--tf-border)' }}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-muted'}`} style={{ fontSize: '0.875rem' }}></i>
            </button>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/app/home" className="btn-pochyaa-nav">
                  <span>Go to App</span>
                  <i className="bi bi-arrow-right small"></i>
                </Link>
                <button className="btn btn-outline-secondary btn-sm" onClick={logout} title="Sign Out">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link to="/login" className="text-decoration-none fw-semibold small px-2" style={{ color: 'var(--tf-text-secondary)' }}>
                  Sign In
                </Link>
                <Link to="/login" className="btn-pochyaa-nav">
                  <span>Explore Demo</span>
                  <i className="bi bi-arrow-right small"></i>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="btn btn-sm btn-outline-secondary d-md-none p-1 ms-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-md-none border-top mt-2 pt-2 px-3 pb-3" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
            <div className="d-flex flex-column gap-1">
              <Link
                to="/product"
                className={`marketing-nav-link ${isActive('/product') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Capabilities
              </Link>
              <Link
                to="/solutions"
                className={`marketing-nav-link ${isActive('/solutions') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link
                to="/security"
                className={`marketing-nav-link ${isActive('/security') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Security & Trust
              </Link>
              <Link
                to="/pricing"
                className={`marketing-nav-link ${isActive('/pricing') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className={`marketing-nav-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-top pt-2 mt-2 d-flex gap-2">
                <Link to="/login" className="btn btn-outline-secondary btn-sm flex-fill" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm flex-fill" onClick={() => setMobileMenuOpen(false)}>
                  Explore Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Public Content ── */}
      <main className="flex-grow-1 position-relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>

      {/* ── Commercial Enterprise Footer ── */}
      <footer className="marketing-footer position-relative" style={{ zIndex: 1, backgroundColor: 'var(--tf-bg-surface)', borderTop: '1px solid var(--tf-border)' }}>
        <div className="container-xl">
          <div className="row g-4 mb-5">
            <div className="col-12 col-lg-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
                <TaskFlowLogo size="md" />
              </Link>
              <p className="text-muted small mb-3 pe-lg-4" style={{ lineHeight: 1.65 }}>
                A deterministic, enterprise-grade work management platform built for modern engineering and product teams. Connect high-level milestone roadmaps, fluid Kanban execution, and forensic audit logs into one unified workspace.
              </p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="ping-beacon">
                  <span className="ping-beacon-wave" style={{ backgroundColor: '#34d399' }}></span>
                  <span className="ping-beacon-dot" style={{ backgroundColor: '#10b981' }}></span>
                </span>
                <span className="small text-success fw-medium font-monospace">API ENGINE ONLINE • Sub-0.09ms</span>
              </div>
              <div className="text-muted small font-monospace">
                Architecture: Laravel 11 • React 18 • MySQL 8.0 B-Tree
              </div>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-semibold text-body small mb-3">Capabilities</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/product" className="text-muted text-decoration-none hover-link">Architecture Overview</Link></li>
                <li><Link to="/product" className="text-muted text-decoration-none hover-link">Multi-View Suite</Link></li>
                <li><Link to="/product" className="text-muted text-decoration-none hover-link">Kanban Swimlanes</Link></li>
                <li><Link to="/product" className="text-muted text-decoration-none hover-link">Gantt Schedules</Link></li>
                <li><Link to="/product" className="text-muted text-decoration-none hover-link">Grounded AI Tasks</Link></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-semibold text-body small mb-3">Solutions</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/solutions" className="text-muted text-decoration-none hover-link">Software Engineering</Link></li>
                <li><Link to="/solutions" className="text-muted text-decoration-none hover-link">Product Management</Link></li>
                <li><Link to="/solutions" className="text-muted text-decoration-none hover-link">Infrastructure & SRE</Link></li>
                <li><Link to="/solutions" className="text-muted text-decoration-none hover-link">Engineering Leadership</Link></li>
                <li><Link to="/pricing" className="text-muted text-decoration-none hover-link">Pricing Plans</Link></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-semibold text-body small mb-3">Security & Trust</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/security" className="text-muted text-decoration-none hover-link">Defense Architecture</Link></li>
                <li><Link to="/security" className="text-muted text-decoration-none hover-link">Role-Based Access (RBAC)</Link></li>
                <li><Link to="/security" className="text-muted text-decoration-none hover-link">Forensic Audit Trail</Link></li>
                <li><Link to="/status" className="text-muted text-decoration-none hover-link">Live Health Probe</Link></li>
                <li><a href="/openapi.yaml" target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-link">OpenAPI 3.0 Spec</a></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-semibold text-body small mb-3">Platform</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/contact" className="text-muted text-decoration-none hover-link">Contact Engineering</Link></li>
                <li><a href="https://github.com/00thirt13n/taskflow" target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-link">GitHub Repository</a></li>
                <li><Link to="/login" className="text-muted text-decoration-none hover-link">Sandbox Demo Login</Link></li>
                <li><Link to="/status" className="text-muted text-decoration-none hover-link">System Metrics</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-top pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
            <div>
              &copy; {new Date().getFullYear()} TaskFlow Platform. Continuous Work Management Assurance.
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge font-monospace" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)' }}>v2.0.0 Enterprise</span>
              <Link to="/security" className="text-muted text-decoration-none">Security Architecture</Link>
              <Link to="/status" className="text-muted text-decoration-none">Operational Health</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
