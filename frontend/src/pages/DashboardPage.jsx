import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    high_priority: 0,
    blocked: 0,
    overdue: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, tasksData, projsData] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ per_page: 8, sort_by: 'created_at', sort_order: 'desc' }),
        projectService.getProjects(),
      ]);
      setStats(statsData || {});
      setRecentTasks(tasksData.data || tasksData || []);
      setProjects(projsData || []);
    } catch {
      addToast('Failed to load cockpit metrics.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenTask = (taskId) => {
    setSearchParams({ task: String(taskId) });
  };

  const handleQuickStatusToggle = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await taskService.updateStatus(task.id, nextStatus);
      addToast(`Work item marked as ${nextStatus === 'done' ? 'completed' : 'todo'}.`, 'success');
      fetchDashboardData();
    } catch {
      addToast('Failed to update status.', 'danger');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const blockedOrOverdue = recentTasks.filter((t) => t.is_blocked || (t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'));
  const highPriority = recentTasks.filter((t) => t.priority === 'high' || t.priority === 'urgent');

  return (
    <div className="py-2">
      {/* 1. MORNING BRIEFING BANNER */}
      <div className="home-greeting-banner">
        <div>
          <h4 className="fw-bold text-body mb-1">
            {getGreeting()}, {user?.name || 'Engineer'}
          </h4>
          <p className="text-muted small mb-0">
            Work in <strong className="text-body">Northstar Engineering</strong> is moving. Here is what needs your attention today.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {stats.blocked > 0 && (
            <span className="home-focus-chip chip-urgent">
              <i className="bi bi-shield-exclamation"></i> {stats.blocked} Blocked
            </span>
          )}
          {stats.high_priority > 0 && (
            <span className="home-focus-chip chip-progress">
              <i className="bi bi-fire"></i> {stats.high_priority} High Priority
            </span>
          )}
          <span className="home-focus-chip chip-done">
            <i className="bi bi-check2-circle"></i> {stats.done} Delivered
          </span>
        </div>
      </div>

      {/* 2. QUICK ACTIONS BAR */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <Link to="/app/tasks" className="btn btn-outline-secondary btn-sm fw-medium">
            <i className="bi bi-kanban me-1"></i> Kanban Board
          </Link>
          <Link to="/app/my-work" className="btn btn-outline-secondary btn-sm fw-medium">
            <i className="bi bi-check2-circle text-success me-1"></i> My Work
          </Link>
          <Link to="/app/projects" className="btn btn-outline-secondary btn-sm fw-medium">
            <i className="bi bi-folder2-open text-primary me-1"></i> All Projects
          </Link>
        </div>

        <div className="text-muted small">
          Active Workspace: <span className="fw-semibold text-body">Northstar Engineering</span>
        </div>
      </div>

      {/* 3. ATTENTION NEEDED WIDGET (BLOCKED / RISKS) */}
      {blockedOrOverdue.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold text-danger mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon-fill"></i> Needs Attention ({blockedOrOverdue.length})
            </h6>
            <span className="text-muted small">Items marked as blocked or past target date</span>
          </div>

          <div className="row g-3">
            {blockedOrOverdue.slice(0, 3).map((task) => (
              <div key={task.id} className="col-12 col-md-4">
                <div
                  className="tf-card p-3 h-100 border-danger border-opacity-25"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)', cursor: 'pointer' }}
                  onClick={() => handleOpenTask(task.id)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="font-monospace fw-bold text-primary small">
                      {task.task_key || `TASK-${task.id}`}
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="fw-medium text-body small mb-2 text-truncate">{task.title}</div>
                  {task.is_blocked && (
                    <div className="p-2 rounded bg-danger bg-opacity-10 text-danger small mb-2" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-slash-circle me-1"></i>
                      <strong>Blocker:</strong> {task.blocker_reason || 'Awaiting external dependency'}
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.75rem' }}>
                    <span>Due: {task.due_date || 'No date'}</span>
                    <span className="text-primary fw-medium">Inspect →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACTIVE PROJECTS & HEALTH */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="tf-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-body mb-0">
                <i className="bi bi-folder2-open text-primary me-2"></i> Active Delivery Projects
              </h6>
              <Link to="/app/projects" className="text-primary small text-decoration-none fw-medium">
                View All ({projects.length})
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {projects.slice(0, 4).map((proj) => {
                const total = proj.task_counts?.total || 1;
                const done = proj.task_counts?.done || 0;
                const progressPct = Math.round((done / total) * 100);
                const health = proj.health || 'healthy';

                const healthBadge = {
                  healthy: <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Healthy</span>,
                  at_risk: <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">At Risk</span>,
                  delayed: <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Delayed</span>,
                }[health];

                return (
                  <div key={proj.id} className="p-2 border rounded bg-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="rounded-circle d-inline-block"
                          style={{ width: 8, height: 8, backgroundColor: proj.color || '#6366f1' }}
                        ></span>
                        <Link to={`/app/projects/${proj.id}`} className="fw-semibold text-body small text-decoration-none hover-link">
                          {proj.name}
                        </Link>
                        <span className="text-muted font-monospace small" style={{ fontSize: '0.68rem' }}>
                          [{proj.key}]
                        </span>
                      </div>
                      {healthBadge}
                    </div>

                    <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                      <span>{done} of {total} deliverables completed</span>
                      <span>{progressPct}%</span>
                    </div>

                    <div className="progress" style={{ height: '5px' }}>
                      <div
                        className={`progress-bar ${health === 'delayed' ? 'bg-danger' : health === 'at_risk' ? 'bg-warning' : 'bg-primary'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY */}
        <div className="col-12 col-lg-5">
          <div className="tf-card p-3 h-100">
            <h6 className="fw-bold text-body mb-3">
              <i className="bi bi-speedometer2 text-info me-2"></i> Sprint Velocity Metrics
            </h6>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-3 border rounded text-center bg-subtle">
                  <div className="text-muted small">Total Items</div>
                  <div className="fs-3 fw-bold text-body">{stats.total}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 border rounded text-center bg-subtle">
                  <div className="text-muted small">In Progress</div>
                  <div className="fs-3 fw-bold text-primary">{stats.in_progress}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 border rounded text-center bg-subtle">
                  <div className="text-muted small">Completed</div>
                  <div className="fs-3 fw-bold text-success">{stats.done}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 border rounded text-center bg-subtle">
                  <div className="text-muted small">High Priority</div>
                  <div className="fs-3 fw-bold text-warning">{stats.high_priority}</div>
                </div>
              </div>
            </div>

            <div className="p-2 border rounded small bg-subtle d-flex justify-content-between align-items-center">
              <span className="text-muted">Weekly Net Completion</span>
              <span className="text-success fw-bold">↑ +14 Deliverables</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TODAY'S PRIORITY DELIVERABLES */}
      <div className="tf-card p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-body mb-0">
            <i className="bi bi-list-task text-primary me-2"></i> High Priority Deliverables
          </h6>
          <Link to="/app/tasks" className="text-primary small text-decoration-none fw-medium">
            View All Tasks →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead>
              <tr className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                <th style={{ width: '40px' }}>Done</th>
                <th>Work Item</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Target Date</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {highPriority.slice(0, 5).map((task) => (
                <tr key={task.id} style={{ cursor: 'pointer' }}>
                  <td onClick={(e) => { e.stopPropagation(); handleQuickStatusToggle(task); }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={task.status === 'done'}
                      onChange={() => {}}
                    />
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <div className="fw-semibold text-body">{task.title}</div>
                    <span className="font-monospace text-primary" style={{ fontSize: '0.7rem' }}>
                      {task.task_key || `TASK-${task.id}`}
                    </span>
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <span className="badge bg-secondary bg-opacity-10 text-body">
                      {task.project?.name || 'General'}
                    </span>
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <span className="text-muted">{task.due_date || '—'}</span>
                  </td>
                  <td onClick={() => handleOpenTask(task.id)}>
                    <div className="d-flex align-items-center gap-1">
                      <div className="avatar-circle" style={{ width: 20, height: 20, fontSize: 9 }}>
                        {task.assignee?.name?.[0] || 'U'}
                      </div>
                      <span className="text-truncate" style={{ maxWidth: 90 }}>
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {highPriority.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No high-priority work items pending. All deliverables on track!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
