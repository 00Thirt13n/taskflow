import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container-xl">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to={isAuthenticated ? '/dashboard' : '/'}>
          <span className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-2 p-1" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-check2-square fs-5"></i>
          </span>
          <span className="fs-5 tracking-tight text-body">Task<span className="text-primary">Flow</span></span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} to="/dashboard">
                    <i className="bi bi-grid-1x2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} to="/tasks">
                    <i className="bi bi-list-task me-1"></i> Tasks
                  </NavLink>
                </li>
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} to="/admin/users">
                        <i className="bi bi-people me-1"></i> Users
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} to="/admin/audit-logs">
                        <i className="bi bi-shield-check me-1"></i> Audit Logs
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="text-end d-none d-md-block">
                    <div className="fw-semibold small text-body">{user?.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                  </div>
                  <span className={`badge ${isAdmin ? 'bg-indigo text-white bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.75rem' }}>
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  onClick={handleLogout}
                  title="Sign out of TaskFlow"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-nav ms-auto d-flex align-items-center gap-2">
              <Link className="nav-link px-3" to="/login">Sign In</Link>
              <Link className="btn btn-primary btn-sm px-3" to="/register">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
