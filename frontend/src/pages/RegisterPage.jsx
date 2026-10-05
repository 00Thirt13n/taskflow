import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await register(formData);
      showToast('Account created successfully! Welcome to TaskFlow.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Registration failed. Please check your details and try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-5">
        <div className="card shadow-sm border p-4 bg-white">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2 mb-2">
              <i className="bi bi-person-plus-fill fs-4"></i>
            </div>
            <h4 className="fw-bold text-dark">Create Your Account</h4>
            <p className="small text-muted mb-0">Join TaskFlow to organize projects and prioritize work</p>
          </div>

          {errors.general && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="regName" className="form-label fw-semibold small text-dark">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="regName"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Elena Rostova"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                autoFocus
              />
              {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="regEmail" className="form-label fw-semibold small text-dark">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="regEmail"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="elena@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="regPassword" className="form-label fw-semibold small text-dark">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="regPassword"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="At least 8 characters, letters & numbers"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
              <div className="form-text small text-muted">
                Must be at least 8 characters with a mix of uppercase, lowercase, and numbers.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="regConfirmPassword" className="form-label fw-semibold small text-dark">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="regConfirmPassword"
                name="password_confirmation"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-medium d-flex justify-content-center align-items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              <span>Create Account</span>
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top small text-muted">
            Already have an account? <Link to="/login" className="text-primary fw-medium text-decoration-none">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
