import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlobalHeader from '../components/GlobalHeader';
import CommandPalette from '../components/CommandPalette';
import TaskCreateModal from '../components/TaskCreateModal';
import TaskDetailDrawer from '../components/TaskDetailDrawer';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const selectedTaskId = searchParams.get('task');

  // Keyboard shortcut listener: 'C' key opens create task modal (when not inside an input)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCreateTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleCloseDrawer = () => {
    searchParams.delete('task');
    setSearchParams(searchParams);
  };

  const handleTaskUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-shell">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Global Header */}
        <GlobalHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreateTask={() => setCreateTaskModalOpen(true)}
        />

        {/* Content View */}
        <main className="app-content">
          <Outlet context={{ refreshTrigger, onTaskUpdated: handleTaskUpdated }} />
        </main>

        {/* Subtle Authenticated Footer */}
        <footer
          className="px-4 py-2 border-top d-flex justify-content-between align-items-center text-muted"
          style={{ fontSize: '0.75rem', borderColor: 'var(--tf-border)', backgroundColor: 'var(--tf-bg-surface)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-body">TaskFlow</span>
            <span>v2.0.0</span>
            <span>•</span>
            <span className="d-inline-flex align-items-center gap-1 text-success">
              <span className="hero-pill-dot bg-success d-inline-block" style={{ width: 6, height: 6 }}></span>
              API Operational
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="text-muted text-decoration-none hover-link">
              OpenAPI Spec
            </a>
            <span className="text-muted">Northstar Engineering</span>
          </div>
        </footer>
      </div>

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenCreateTask={() => setCreateTaskModalOpen(true)}
      />

      {/* Quick Task Create Modal (Shortcut: C) */}
      <TaskCreateModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskUpdated}
      />

      {/* Slide-over Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          onClose={handleCloseDrawer}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
