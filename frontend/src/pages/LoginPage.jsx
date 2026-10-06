import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskFlowLogo from '../components/TaskFlowLogo';
import ParticleCanvas from '../components/ParticleCanvas';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activePersona, setActivePersona] = useState(null);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/home';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setActivePersona(null);
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailTrimmed = credentials.email.trim();
    const passwordTrimmed = credentials.password;

    if (!emailTrimmed || !passwordTrimmed) {
      setErrors({
        email: !emailTrimmed ? ['The email field is required.'] : null,
        password: !passwordTrimmed ? ['The password field is required.'] : null,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(emailTrimmed, passwordTrimmed);
      addToast('Signed in successfully. Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: err.response.data?.message || 'Invalid email or password.' });
      } else if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.status === 429) {
        setErrors({ general: 'Rate limit reached. Please wait one minute before trying again.' });
      } else {
        setErrors({ general: 'Server connection error. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = (personaKey, email, password) => {
    setActivePersona(personaKey);
    setCredentials({ email, password });
    setErrors({});
  };

  return (
    <div className="tf-ambient-canvas position-relative" style={{ overflow: 'hidden' }}>
      <ParticleCanvas />
      <div className="ambient-glow-top"></div>
      <div className="ambient-glow-left"></div>
      <div className="tf-auth-card position-relative" style={{ zIndex: 1 }}>
        {/* Header with Brand & Welcome */}
        <div className="text-center mb-4">
          <TaskFlowLogo size="lg" className="mb-3 justify-content-center" />
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.025em', color: 'var(--tf-text-main)' }}>
            Welcome back
          </h3>
          <p className="small mb-0" style={{ color: 'var(--tf-text-muted)' }}>
            Sign in to access your projects, tasks, and team workspace
          </p>
        </div>

        {/* Quick Demo Access - Modern Persona Selector */}
        <div className="tf-persona-container">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="small fw-semibold d-flex align-items-center gap-1.5" style={{ color: 'var(--tf-text-main)' }}>
              <i className="bi bi-lightning-charge-fill text-warning"></i>
              <span>One-Click Exploration</span>
            </span>
            <span className="badge bg-secondary bg-opacity-10 text-muted" style={{ fontSize: '0.7rem' }}>
              Northstar Org
            </span>
          </div>

          <div className="d-flex flex-column gap-2">
            {/* Persona 1: Admin */}
            <button
              type="button"
              className={`tf-persona-card ${activePersona === 'admin' ? 'active' : ''}`}
              onClick={() => selectPersona('admin', 'admin@taskflow.dev', 'Password123!')}
              title="Sign in as Workspace Admin"
            >
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="tf-persona-avatar"
                  style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}
                >
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <div className="tf-persona-title line-clamp-1">Maya Lin</div>
                  <div className="tf-persona-sub">Workspace Admin</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style={{ fontSize: '0.7rem' }}>
                  Admin
                </span>
                {activePersona === 'admin' && (
                  <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '0.85rem' }}></i>
                )}
              </div>
            </button>

            {/* Persona 2: Member */}
            <button
              type="button"
              className={`tf-persona-card ${activePersona === 'member' ? 'active' : ''}`}
              onClick={() => selectPersona('member', 'demo@taskflow.dev', 'Password123!')}
              title="Sign in as Lead Engineer"
            >
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="tf-persona-avatar"
                  style={{ background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}
                >
                  <i className="bi bi-code-slash"></i>
                </div>
                <div>
                  <div className="tf-persona-title line-clamp-1">Arjun Patel</div>
                  <div className="tf-persona-sub">Lead Engineer</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                  Member
                </span>
                {activePersona === 'member' && (
                  <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '0.85rem' }}></i>
                )}
              </div>
            </button>

            {/* Persona 3: Designer */}
            <button
              type="button"
              className={`tf-persona-card ${activePersona === 'designer' ? 'active' : ''}`}
              onClick={() => selectPersona('designer', 'sarah@taskflow.dev', 'Password123!')}
              title="Sign in as Staff Designer"
            >
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="tf-persona-avatar"
                  style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}
                >
                  <i className="bi bi-palette"></i>
                </div>
                <div>
                  <div className="tf-persona-title line-clamp-1">Sofia Rossi</div>
                  <div className="tf-persona-sub">Staff Designer</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: '0.7rem' }}>
                  Tenant Isolation
                </span>
                {activePersona === 'designer' && (
                  <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '0.85rem' }}></i>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errors.general && (
          <div className="alert alert-danger py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill text-danger flex-shrink-0"></i>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label small fw-semibold text-secondary mb-1.5">
              Work Email
            </label>
            <div className="tf-input-wrap">
              <i className="bi bi-envelope tf-input-icon"></i>
              <input
                type="email"
                id="loginEmail"
                name="email"
                className={`tf-input-modern ${errors.email ? 'border-danger' : ''}`}
                placeholder="name@company.com"
                value={credentials.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <div className="text-danger small mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-exclamation-circle"></i> {errors.email[0]}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <label htmlFor="loginPassword" className="form-label small fw-semibold text-secondary mb-0">
                Password
              </label>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Password123!
              </span>
            </div>
            <div className="tf-input-wrap">
              <i className="bi bi-lock tf-input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="loginPassword"
                name="password"
                className={`tf-input-modern pe-5 ${errors.password ? 'border-danger' : ''}`}
                placeholder="••••••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="tf-input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="text-danger small mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-exclamation-circle"></i> {errors.password[0]}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="tf-btn-gradient"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Workspace</span>
            )}
          </button>
        </form>

        {/* Security & Isolation Footnote */}
        <div className="d-flex align-items-center justify-content-center gap-1.5 mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-shield-lock text-success"></i>
          <span>Encrypted Session • Multi-Tenant RBAC</span>
        </div>

        {/* Registration Link */}
        <div className="text-center mt-3 pt-3 border-top">
          <span className="text-muted small">Need a new workspace? </span>
          <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
