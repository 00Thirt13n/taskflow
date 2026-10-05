import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette({ isOpen, onClose, onOpenCreateTask }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [], users: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ tasks: [], projects: [], users: [] });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K or /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ tasks: [], projects: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchService.search(query);
        setResults(data);
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleAction = (action) => {
    onClose();
    action();
  };

  const defaultActions = [
    {
      id: 'create-task',
      label: 'Create new task',
      icon: 'bi-plus-circle-fill text-primary',
      shortcut: 'C',
      action: () => onOpenCreateTask(),
    },
    {
      id: 'go-dashboard',
      label: 'Go to Overview Dashboard',
      icon: 'bi-grid-1x2',
      shortcut: 'G D',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'go-my-work',
      label: 'Go to My Work',
      icon: 'bi-check2-circle text-success',
      shortcut: 'G W',
      action: () => navigate('/my-work'),
    },
    {
      id: 'go-projects',
      label: 'Go to Projects',
      icon: 'bi-folder text-warning',
      shortcut: 'G P',
      action: () => navigate('/projects'),
    },
    {
      id: 'go-tasks',
      label: 'Go to All Tasks',
      icon: 'bi-list-task',
      shortcut: 'G T',
      action: () => navigate('/tasks'),
    },
    {
      id: 'go-reports',
      label: 'Go to Analytics & Reports',
      icon: 'bi-bar-chart-line text-info',
      shortcut: 'G R',
      action: () => navigate('/reports'),
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? 'bi-sun text-warning' : 'bi-moon text-secondary',
      shortcut: '',
      action: () => toggleTheme(),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: 'bi-box-arrow-right text-danger',
      shortcut: '',
      action: () => logout(),
    },
  ];

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center px-3 border-bottom">
          <i className="bi bi-search text-muted fs-5 me-2"></i>
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Type a command or search tasks, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="kbd-shortcut">ESC</span>
        </div>

        <div className="command-list" style={{ maxHeight: '420px' }}>
          {loading && (
            <div className="text-center py-3 text-muted small">
              <span className="spinner-border spinner-border-sm me-2"></span>Searching...
            </div>
          )}

          {/* Search Results */}
          {results.tasks.length > 0 && (
            <div>
              <div className="sidebar-section-title px-2 pt-2">Tasks</div>
              {results.tasks.map((task) => (
                <div
                  key={`task-${task.id}`}
                  className="command-item"
                  onClick={() => handleAction(() => navigate(`/tasks?task=${task.id}`))}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.7rem' }}>
                      {task.key}
                    </span>
                    <span className="text-truncate" style={{ maxWidth: '380px' }}>{task.title}</span>
                  </div>
                  <span className="badge-status badge-status-todo" style={{ fontSize: '0.65rem' }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {results.projects.length > 0 && (
            <div>
              <div className="sidebar-section-title px-2 pt-2">Projects</div>
              {results.projects.map((proj) => (
                <div
                  key={`proj-${proj.id}`}
                  className="command-item"
                  onClick={() => handleAction(() => navigate(`/projects/${proj.id}`))}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi bi-${proj.icon || 'folder'}`} style={{ color: proj.color }}></i>
                    <span>{proj.name}</span>
                  </div>
                  <span className="badge bg-light text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
                    {proj.key}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="sidebar-section-title px-2 pt-2">Navigation & Quick Actions</div>
              {defaultActions.map((act) => (
                <div
                  key={act.id}
                  className="command-item"
                  onClick={() => handleAction(act.action)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${act.icon}`}></i>
                    <span>{act.label}</span>
                  </div>
                  {act.shortcut && <span className="kbd-shortcut">{act.shortcut}</span>}
                </div>
              ))}
            </div>
          )}

          {query && !loading && results.tasks.length === 0 && results.projects.length === 0 && (
            <div className="text-center py-4 text-muted small">
              No matching tasks or projects found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
