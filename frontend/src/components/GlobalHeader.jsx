import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export default function GlobalHeader({ onToggleSidebar, onOpenCommandPalette, onOpenCreateTask }) {
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Derive breadcrumb path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) {
      return ['Workspace', 'Projects', 'Detail'];
    }
    if (path === '/my-work') return ['Workspace', 'My Work'];
    if (path === '/tasks') return ['Workspace', 'Tasks'];
    if (path === '/reports') return ['Workspace', 'Reports'];
    if (path.startsWith('/admin')) return ['Workspace', 'Administration'];
    return ['Workspace', 'Overview'];
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

        <nav aria-label="breadcrumb" className="breadcrumb-nav d-none d-sm-flex">
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>}
              <span className={idx === crumbs.length - 1 ? 'breadcrumb-item-active' : ''}>
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
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
          onClick={onOpenCreateTask}
          title="Create new task (shortcut: C)"
        >
          <i className="bi bi-plus-lg"></i>
          <span className="d-none d-sm-inline">Create</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="position-relative">
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
              className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border"
              style={{
                width: '320px',
                zIndex: 1060,
                backgroundColor: 'var(--tf-bg-surface)',
                borderColor: 'var(--tf-border)',
              }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-semibold small">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-primary p-0"
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
                    className={`p-3 border-bottom small ${
                      !n.is_read ? 'bg-light' : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: !n.is_read ? 'var(--tf-primary-subtle)' : 'transparent',
                    }}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-truncate" style={{ maxWidth: '210px' }}>
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
