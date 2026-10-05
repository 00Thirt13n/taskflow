import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

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
      await login(credentials);
      showToast('Signed in successfully.');
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
        <div className="card shadow-sm border p-4 bg-white">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2 mb-2">
              <i className="bi bi-box-arrow-in-right fs-4"></i>
            </div>
            <h4 className="fw-bold text-dark">Sign In to TaskFlow</h4>
            <p className="small text-muted mb-0">Enter your credentials to manage your tasks</p>
          </div>

          {/* Quick Demo Fill Pill Buttons */}
          <div className="bg-light p-3 rounded-3 mb-4 border">
            <div className="small fw-semibold text-secondary mb-2 d-flex align-items-center gap-1">
              <i className="bi bi-lightning-charge-fill text-warning"></i> Quick Demo Accounts (1-Click Fill):
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-grow-1"
                onClick={() => fillCredentials('admin@taskflow.dev', 'Password123!')}
              >
                <i className="bi bi-shield-lock me-1"></i> Admin Persona
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-grow-1"
                onClick={() => fillCredentials('demo@taskflow.dev', 'Password123!')}
              >
                <i className="bi bi-person me-1"></i> Standard User Persona
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
              <label htmlFor="loginEmail" className="form-label fw-semibold small text-dark">
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
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="loginPassword" className="form-label fw-semibold small text-dark mb-0">
                  Password
                </label>
              </div>
              <input
                type="password"
                id="loginPassword"
                name="password"
                className={`form-control mt-1 ${errors.password ? 'is-invalid' : ''}`}
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
              <span>Sign In</span>
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            Don't have an account yet? <Link to="/register" className="text-primary fw-medium text-decoration-none">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
