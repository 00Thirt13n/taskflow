import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { projectService } from '../services/projectService';
import TaskFlowLogo from './TaskFlowLogo';

export default function Sidebar({ isOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    projectService.getProjects()
      .then((data) => {
        if (isMounted) setProjects(data || []);
      })
      .catch(() => {});
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

  const isRouteActive = (paths) => {
    return paths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Workspace Header with TaskFlowLogo */}
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <Link to="/app/home" className="d-flex align-items-center text-decoration-none">
          <TaskFlowLogo size="sm" />
        </Link>
        <button
          className="btn btn-sm btn-link text-muted d-md-none p-1"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Workspace Selector Bar */}
      <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--tf-border)', backgroundColor: 'var(--tf-bg-subtle)' }}>
        <div className="d-flex align-items-center gap-2 text-truncate">
          <div className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold" style={{ width: 20, height: 20, backgroundColor: '#6366f1', fontSize: 10 }}>
            N
          </div>
          <span className="small fw-semibold text-body text-truncate" style={{ fontSize: '0.8125rem' }}>
            Northstar Engineering
          </span>
        </div>
        <i className="bi bi-chevron-expand text-muted small"></i>
      </div>

      {/* Navigation Body */}
      <div className="sidebar-body">
        {/* OVERVIEW SECTION */}
        <div>
          <div className="sidebar-section-header">Overview</div>
          <nav className="d-flex flex-column gap-1">
            <NavLink
              to="/app/home"
              className={`sidebar-nav-item ${isRouteActive(['/app/home', '/dashboard']) ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-house-door"></i>
              <span>Home Cockpit</span>
            </NavLink>

            <NavLink
              to="/app/my-work"
              className={`sidebar-nav-item ${isRouteActive(['/app/my-work', '/my-work']) ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-check2-circle text-success"></i>
              <span>My Work</span>
            </NavLink>

            <NavLink
              to="/app/projects"
              className={`sidebar-nav-item ${isRouteActive(['/app/projects', '/projects']) && !location.pathname.includes('/projects/') ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-folder2-open text-primary"></i>
              <span>Projects</span>
            </NavLink>
          </nav>
        </div>

        {/* WORK SECTION */}
        <div>
          <div className="sidebar-section-header">Execution</div>
          <nav className="d-flex flex-column gap-1">
            <NavLink
              to="/app/tasks"
              className={`sidebar-nav-item ${isRouteActive(['/app/tasks', '/tasks']) ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-kanban"></i>
              <span>Tasks & Views</span>
            </NavLink>

            <NavLink
              to="/app/reports"
              className={`sidebar-nav-item ${isRouteActive(['/app/reports', '/reports']) ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <i className="bi bi-graph-up text-info"></i>
              <span>Reports & Velocity</span>
            </NavLink>
          </nav>
        </div>

        {/* PROJECTS ACCORDION */}
        <div>
          <div className="d-flex align-items-center justify-content-between sidebar-section-header">
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              Projects <i className={`bi bi-chevron-${projectsExpanded ? 'down' : 'right'} ms-1`} style={{ fontSize: '0.65rem' }}></i>
            </span>
            <Link to="/app/projects" className="text-muted text-decoration-none small hover-link" title="Manage Projects">
              <i className="bi bi-plus-lg"></i>
            </Link>
          </div>

          {projectsExpanded && (
            <nav className="d-flex flex-column gap-1 mt-1">
              {projects.map((proj) => (
                <NavLink
                  key={proj.id}
                  to={`/app/projects/${proj.id}`}
                  className={`sidebar-nav-item ${location.pathname === `/app/projects/${proj.id}` || location.pathname === `/projects/${proj.id}` ? 'active' : ''}`}
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
                <div className="text-muted small px-3 py-1" style={{ fontSize: '0.75rem' }}>
                  No projects yet.
                </div>
              )}
            </nav>
          )}
        </div>

        {/* ADMIN CENTER SECTION */}
        {user?.is_admin && (
          <div>
            <div className="sidebar-section-header">Administration</div>
            <nav className="d-flex flex-column gap-1">
              <NavLink
                to="/app/admin/users"
                className={`sidebar-nav-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-people"></i>
                <span>Team Roster</span>
              </NavLink>

              <NavLink
                to="/app/admin/audit-logs"
                className={`sidebar-nav-item ${location.pathname.includes('/admin/audit-logs') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-journal-text"></i>
                <span>Audit Logs</span>
              </NavLink>

              <NavLink
                to="/app/admin/system-health"
                className={`sidebar-nav-item ${location.pathname.includes('/admin/system-health') ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className="bi bi-activity text-success"></i>
                <span>System Health</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer: User Persona, Theme Toggle & Sign Out */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 text-truncate">
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <div className="text-truncate" style={{ maxWidth: '120px' }}>
            <div className="fw-semibold text-truncate text-body" style={{ fontSize: '0.8125rem' }}>{user?.name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
              {user?.role?.name || 'Member'}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-1">
          <button
            className="btn btn-sm btn-link text-muted p-1 text-decoration-none"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun text-warning' : 'bi-moon'}`}></i>
          </button>
          <button
            className="btn btn-sm btn-link text-danger p-1 text-decoration-none"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign out"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
