import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskFlowLogo from '../components/TaskFlowLogo';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/home';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await login(credentials.email, credentials.password);
      addToast('Signed in successfully. Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: err.response.data.message || 'Invalid email or password.' });
      } else if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Server connection error. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setCredentials({ email, password });
    setErrors({});
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-5">
        <div className="tf-card p-4 shadow-sm border">
          <div className="text-center mb-4">
            <TaskFlowLogo size="lg" className="mb-3 justify-content-center" />
            <h4 className="fw-bold text-body">Sign In to TaskFlow</h4>
            <p className="small text-muted mb-0">Enter your credentials to access your workspace</p>
          </div>

          {/* Quick Demo Access Buttons with Believable Personas */}
          <div className="p-3 rounded mb-4 border bg-subtle">
            <div className="small fw-semibold text-body mb-2 d-flex align-items-center gap-1">
              <i className="bi bi-lightning-charge-fill text-warning"></i>
              <span>One-Click Exploration (Northstar Engineering):</span>
            </div>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center"
                onClick={() => fillCredentials('admin@taskflow.dev', 'Password123!')}
              >
                <span>
                  <i className="bi bi-shield-lock me-1"></i>
                  <span className="fw-bold">Maya Lin</span> (Workspace Admin)
                </span>
                <span className="badge bg-danger bg-opacity-10 text-danger">Admin</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center"
                onClick={() => fillCredentials('demo@taskflow.dev', 'Password123!')}
              >
                <span>
                  <i className="bi bi-person-gear me-1"></i>
                  <span className="fw-bold">Arjun Patel</span> (Lead Engineer)
                </span>
                <span className="badge bg-primary bg-opacity-10 text-primary">Member</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-start d-flex justify-content-between align-items-center"
                onClick={() => fillCredentials('sarah@taskflow.dev', 'Password123!')}
              >
                <span>
                  <i className="bi bi-palette me-1"></i>
                  <span className="fw-bold">Sofia Rossi</span> (Staff Designer)
                </span>
                <span className="badge bg-info bg-opacity-10 text-info">Tenant Isolation</span>
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label fw-semibold small text-body">
                Email Address
              </label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@taskflow.dev"
                value={credentials.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
              {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="loginPassword" className="form-label fw-semibold small text-body">
                Password
              </label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-medium d-flex justify-content-center align-items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              <span>Sign In to Workspace</span>
            </button>
          </form>

          <div className="text-center mt-3 pt-2 border-top">
            <span className="text-muted small">Need a new workspace? </span>
            <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
