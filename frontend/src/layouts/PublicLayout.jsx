import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TaskFlowLogo from '../components/TaskFlowLogo';

export default function PublicLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--tf-bg-main)' }}>
      {/* Commercial Sticky Marketing Header */}
      <header className="marketing-header py-2 px-3">
        <div className="container-xl d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link to="/" className="d-flex align-items-center text-decoration-none">
            <TaskFlowLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-md-flex align-items-center gap-1">
            <Link to="/product" className={`marketing-nav-link ${isActive('/product') ? 'active' : ''}`}>
              Product
            </Link>
            <Link to="/solutions" className={`marketing-nav-link ${isActive('/solutions') ? 'active' : ''}`}>
              Solutions
            </Link>
            <Link to="/security" className={`marketing-nav-link ${isActive('/security') ? 'active' : ''}`}>
              Security
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
              className="btn btn-sm btn-link text-muted p-2 text-decoration-none"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
            </button>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/app/home" className="btn btn-primary btn-sm px-3 fw-medium">
                  Go to App <i className="bi bi-arrow-right ms-1"></i>
                </Link>
                <button className="btn btn-outline-secondary btn-sm" onClick={logout} title="Sign Out">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-secondary px-3 fw-medium d-none d-sm-inline-flex">
                  Sign In
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm px-3 fw-medium">
                  Explore Demo
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
          <div className="d-md-none border-top mt-2 pt-2 px-3 pb-3 bg-surface" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
            <div className="d-flex flex-column gap-1">
              <Link
                to="/product"
                className={`marketing-nav-link ${isActive('/product') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Product Capabilities
              </Link>
              <Link
                to="/solutions"
                className={`marketing-nav-link ${isActive('/solutions') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions & Use Cases
              </Link>
              <Link
                to="/security"
                className={`marketing-nav-link ${isActive('/security') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Security & Architecture
              </Link>
              <Link
                to="/pricing"
                className={`marketing-nav-link ${isActive('/pricing') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing & Editions
              </Link>
              <Link
                to="/contact"
                className={`marketing-nav-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact & Demo
              </Link>
              <div className="border-top pt-2 mt-1 d-flex gap-2">
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

      {/* Main Public Content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Commercial Enterprise Footer */}
      <footer className="marketing-footer">
        <div className="container-xl">
          <div className="row g-4 mb-5">
            <div className="col-12 col-lg-4">
              <TaskFlowLogo size="md" className="mb-3" />
              <p className="text-muted small mb-3 pe-lg-4" style={{ lineHeight: 1.6 }}>
                A focused work management platform built for modern engineering and product teams. Connect planning, execution, and visibility into one high-performance workspace.
              </p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="hero-pill-dot" style={{ width: 8, height: 8 }}></span>
                <span className="small text-success fw-medium">All Systems Operational</span>
              </div>
              <div className="text-muted small">
                Architecture: Laravel 11 • React 18 • MySQL 8.0
              </div>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-body small text-uppercase tracking-wider mb-3">Product</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/product">Interactive Overview</Link></li>
                <li><Link to="/product#views">Multi-View Suite</Link></li>
                <li><Link to="/product#kanban">Kanban Board</Link></li>
                <li><Link to="/product#timeline">Gantt Timeline</Link></li>
                <li><Link to="/product#ai">Grounded AI</Link></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-body small text-uppercase tracking-wider mb-3">Solutions</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/solutions">For Engineering</Link></li>
                <li><Link to="/solutions">For Product Teams</Link></li>
                <li><Link to="/solutions">For Operations</Link></li>
                <li><Link to="/solutions">For Team Leaders</Link></li>
                <li><Link to="/pricing">Pricing Plans</Link></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-body small text-uppercase tracking-wider mb-3">Security & Trust</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/security">Security Architecture</Link></li>
                <li><Link to="/security#rbac">Role-Based Access</Link></li>
                <li><Link to="/security#audit">Immutable Audit Logs</Link></li>
                <li><Link to="/status">System Status</Link></li>
                <li><a href="/openapi.yaml" target="_blank" rel="noreferrer">OpenAPI Specification</a></li>
              </ul>
            </div>

            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-body small text-uppercase tracking-wider mb-3">Company</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li><Link to="/contact">Contact Team</Link></li>
                <li><a href="https://github.com/00thirt13n/taskflow" target="_blank" rel="noreferrer">GitHub Repository</a></li>
                <li><a href="/docs/architecture.md" target="_blank" rel="noreferrer">Architecture Doc</a></li>
                <li><Link to="/login">Demo Login</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-top pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
            <div>
              &copy; {new Date().getFullYear()} TaskFlow Platform. All rights reserved.
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-secondary bg-opacity-10 text-muted border">v2.0.0 Enterprise</span>
              <Link to="/security" className="text-muted text-decoration-none">Privacy & Security</Link>
              <Link to="/status" className="text-muted text-decoration-none">Operational Health</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
