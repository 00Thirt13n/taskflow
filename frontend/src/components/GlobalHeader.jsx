import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export default function GlobalHeader({ onToggleSidebar, onOpenCommandPalette, onOpenCreateTask }) {
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Quiet recovery
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Quiet recovery
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Quiet recovery
    }
  };

  // Derive breadcrumb path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/projects/')) return ['Northstar', 'Projects', 'Deliverables'];
    if (path.includes('/projects')) return ['Northstar', 'Projects'];
    if (path.includes('/my-work')) return ['Northstar', 'My Work'];
    if (path.includes('/tasks')) return ['Northstar', 'Tasks & Views'];
    if (path.includes('/reports')) return ['Northstar', 'Reports & Velocity'];
    if (path.includes('/admin/users')) return ['Administration', 'Team Roster'];
    if (path.includes('/admin/audit-logs')) return ['Administration', 'Audit Logs'];
    if (path.includes('/admin/system-health')) return ['Administration', 'System Health'];
    return ['Northstar', 'Home Cockpit'];
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="global-header">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-link text-muted p-0 d-md-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <nav aria-label="breadcrumb" className="breadcrumb-nav d-none d-sm-flex align-items-center">
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <i className="bi bi-chevron-right text-muted mx-1" style={{ fontSize: '0.65rem' }}></i>}
              <span className={idx === crumbs.length - 1 ? 'breadcrumb-item-active text-body fw-semibold' : 'text-muted'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Search Trigger (Command Palette) */}
      <div className="d-none d-md-block" style={{ width: '320px' }}>
        <button
          className="header-search-btn w-100 justify-content-between"
          onClick={onOpenCommandPalette}
          aria-label="Search or jump to command"
        >
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-search"></i>
            <span>Search or jump to...</span>
          </span>
          <span className="kbd-shortcut">Ctrl K</span>
        </button>
      </div>

      {/* Right Controls: Quick Create + Notification Center */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm fw-medium px-3"
          onClick={onOpenCreateTask}
          title="Create new work item (shortcut: C)"
        >
          <i className="bi bi-plus-lg"></i>
          <span className="d-none d-sm-inline">New Item</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn btn-sm btn-link text-muted position-relative p-2"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <i className="bi bi-bell fs-5"></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 rounded shadow-lg border"
              style={{
                width: '320px',
                zIndex: 1060,
                backgroundColor: 'var(--tf-bg-surface)',
                borderColor: 'var(--tf-border)',
              }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--tf-border)' }}>
                <span className="fw-semibold small text-body">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 border-bottom small"
                    style={{
                      cursor: 'pointer',
                      borderColor: 'var(--tf-border)',
                      backgroundColor: !n.is_read ? 'var(--tf-primary-subtle)' : 'transparent',
                    }}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-truncate text-body" style={{ maxWidth: '210px' }}>
                        {n.title}
                      </strong>
                      <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                        {n.created_at}
                      </span>
                    </div>
                    <div className="text-muted text-break">{n.message}</div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-4 text-muted small">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
