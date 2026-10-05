import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function PublicLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--tf-bg-main)' }}>
      {/* Public Header */}
      <nav className="navbar navbar-expand border-bottom px-3 py-2" style={{ backgroundColor: 'var(--tf-bg-surface)', borderColor: 'var(--tf-border)' }}>
        <div className="container-xl d-flex justify-content-between align-items-center">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none" style={{ color: 'var(--tf-text-main)' }}>
            <div
              className="rounded d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '28px', height: '28px', backgroundColor: 'var(--tf-primary)' }}
            >
              TF
            </div>
            <span>TaskFlow</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-link text-muted p-1"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun text-warning' : 'bi-moon'}`}></i>
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  Go to Workspace
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1">
        <div className="container-xl py-4">
          <Outlet />
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-top py-3 text-muted small" style={{ backgroundColor: 'var(--tf-bg-surface)', borderColor: 'var(--tf-border)' }}>
        <div className="container-xl d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div>
            <strong>TaskFlow</strong> v1.2.0 &copy; {new Date().getFullYear()} — Enterprise Work Management Platform
          </div>
          <div className="d-flex align-items-center gap-3">
            <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="text-muted text-decoration-none">
              API Documentation
            </a>
            <Link to="/dashboard" className="text-muted text-decoration-none">
              Live Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
