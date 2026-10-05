import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { projectService } from '../services/projectService';

export default function Sidebar({ isOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;
    projectService.getProjects()
      .then((data) => {
        if (isMounted) setProjects(data);
      })
      .catch((err) => console.error('Failed to load projects in sidebar:', err));
    return () => { isMounted = false; };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Workspace Header */}
      <div className="sidebar-header">
        <Link to="/dashboard" className="workspace-badge text-decoration-none">
          <div
            className="rounded d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ width: '28px', height: '28px', backgroundColor: 'var(--tf-primary)' }}
          >
            TF
          </div>
          <div>
            <div className="text-truncate" style={{ maxWidth: '140px' }}>TaskFlow</div>
            <div className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 'normal' }}>
              Engineering
            </div>
          </div>
        </Link>
        <button
          className="btn btn-sm text-muted d-md-none"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Navigation Body */}
      <div className="sidebar-body">
        {/* Core Views */}
        <div>
          <div className="sidebar-section-title">Workspace</div>
          <nav className="d-flex flex-column gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-grid-1x2"></i>
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/my-work"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-check2-circle text-success"></i>
              <span>My Work</span>
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-list-task"></i>
              <span>All Tasks</span>
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-bar-chart-line text-info"></i>
              <span>Reports</span>
            </NavLink>
          </nav>
        </div>

        {/* Projects Tree */}
        <div>
          <div className="d-flex align-items-center justify-content-between sidebar-section-title">
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              Projects <i className={`bi bi-chevron-${projectsExpanded ? 'down' : 'right'} ms-1`} style={{ fontSize: '0.65rem' }}></i>
            </span>
            <Link to="/projects" className="text-muted text-decoration-none small hover-link" title="Manage Projects">
              <i className="bi bi-plus"></i>
            </Link>
          </div>

          {projectsExpanded && (
            <nav className="d-flex flex-column gap-1 mt-1">
              {projects.map((proj) => (
                <NavLink
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={onCloseMobile}
                >
                  <span
                    className="rounded-circle d-inline-block flex-shrink-0"
                    style={{ width: '8px', height: '8px', backgroundColor: proj.color || 'var(--tf-primary)' }}
                  ></span>
                  <span className="text-truncate flex-grow-1" style={{ fontSize: '0.8125rem' }}>
                    {proj.name}
                  </span>
                  <span className="text-muted font-monospace" style={{ fontSize: '0.65rem' }}>
                    {proj.key}
                  </span>
                </NavLink>
              ))}

              {projects.length === 0 && (
                <div className="text-muted small px-2 py-1" style={{ fontSize: '0.75rem' }}>
                  No projects yet.
                </div>
              )}
            </nav>
          )}
        </div>

        {/* Admin Navigation */}
        {user?.is_admin && (
          <div>
            <div className="sidebar-section-title">Administration</div>
            <nav className="d-flex flex-column gap-1">
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-people"></i>
                <span>Team Members</span>
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-journal-text"></i>
                <span>Audit Logs</span>
              </NavLink>

              <NavLink
                to="/admin/system-health"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-activity text-success"></i>
                <span>System Health</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer: Theme Toggle & User Info */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 text-truncate">
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <div className="text-truncate" style={{ maxWidth: '120px' }}>
            <div className="fw-semibold text-truncate" style={{ fontSize: '0.8125rem' }}>{user?.name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
              {user?.role?.name || 'Member'}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-link text-muted p-1"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun text-warning' : 'bi-moon'}`}></i>
          </button>
          <button
            className="btn btn-sm btn-link text-danger p-1"
            onClick={logout}
            title="Sign Out"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
