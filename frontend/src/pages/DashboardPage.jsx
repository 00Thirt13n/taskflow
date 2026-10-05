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
        taskService.getTasks({ per_page: 6, sort_by: 'created_at', sort_order: 'desc' }),
        projectService.getProjects(),
      ]);
      setStats(statsData || {});
      setRecentTasks(tasksData.data || tasksData || []);
      setProjects(projsData || []);
    } catch {
      addToast('Failed to load dashboard metrics.', 'danger');
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
      addToast(`Task marked as ${nextStatus === 'done' ? 'completed' : 'todo'}.`, 'success');
      fetchDashboardData();
    } catch {
      addToast('Failed to update task status.', 'danger');
    }
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>
            Welcome back, {user?.name}
          </h2>
          <p className="text-muted small mb-0">
            Executive overview of workspace initiatives, deliverables, and team execution.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/reports" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-bar-chart-line"></i>
            <span>Analytics</span>
          </Link>
          <Link to="/tasks" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-list-task"></i>
            <span>View Tasks</span>
          </Link>
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {stats.overdue > 0 && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-4 border-0 rounded shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-octagon-fill fs-4 text-danger"></i>
            <div>
              <strong className="d-block" style={{ fontSize: '0.875rem' }}>
                Action Required: {stats.overdue} overdue deliverable{stats.overdue > 1 ? 's' : ''}!
              </strong>
              <span className="small text-danger-emphasis">
                Deliverables have passed their scheduled target dates.
              </span>
            </div>
          </div>
          <Link to="/tasks?preset=overdue" className="btn btn-danger btn-sm text-nowrap">
            Review Overdue
          </Link>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2">
          <Link to="/tasks" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">Total Tasks</div>
            <div className="fs-3 fw-bold mt-1">{loading ? '—' : stats.total}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-layers text-primary me-1"></i> Active scope
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-2">
          <Link to="/tasks?status=todo" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">To Do</div>
            <div className="fs-3 fw-bold text-secondary mt-1">{loading ? '—' : stats.todo}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-clock text-secondary me-1"></i> Backlog
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-2">
          <Link to="/tasks?status=in-progress" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">In Progress</div>
            <div className="fs-3 fw-bold text-primary mt-1">{loading ? '—' : stats.in_progress}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-arrow-repeat text-primary me-1"></i> Active execution
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-2">
          <Link to="/tasks?status=done" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">Completed</div>
            <div className="fs-3 fw-bold text-success mt-1">{loading ? '—' : stats.done}</div>
            <div className="small text-success mt-auto pt-2">
              <i className="bi bi-check-circle-fill me-1"></i> {completionPercentage}% finished
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-2">
          <Link to="/tasks?preset=blocked" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">Blocked</div>
            <div className={`fs-3 fw-bold mt-1 ${stats.blocked > 0 ? 'text-warning' : 'text-muted'}`}>
              {loading ? '—' : stats.blocked}
            </div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-flag-fill text-warning me-1"></i> Roadblocks
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-2">
          <Link to="/tasks?preset=overdue" className="tf-card p-3 h-100 d-block text-decoration-none" style={{ color: 'inherit' }}>
            <div className="text-muted small fw-medium">Overdue</div>
            <div className={`fs-3 fw-bold mt-1 ${stats.overdue > 0 ? 'text-danger' : 'text-muted'}`}>
              {loading ? '—' : stats.overdue}
            </div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-calendar-x text-danger me-1"></i> Past due
            </div>
          </Link>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="tf-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small">Workspace Overall Completion Velocity</span>
          <span className="fw-bold small text-primary">{completionPercentage}%</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="row g-4">
        {/* ACTIVE PROJECTS OVERVIEW */}
        <div className="col-12 col-lg-4">
          <div className="tf-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>Active Projects</h5>
              <Link to="/projects" className="btn btn-sm btn-link text-primary p-0">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="p-3 rounded bg-light border text-decoration-none d-block"
                  style={{ backgroundColor: 'var(--tf-bg-subtle)', color: 'inherit' }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{ width: '8px', height: '8px', backgroundColor: p.color }}
                      ></span>
                      <strong className="text-truncate" style={{ maxWidth: '140px', fontSize: '0.85rem' }}>
                        {p.name}
                      </strong>
                    </div>
                    <span className={`badge ${
                      p.health === 'Healthy' ? 'bg-success' : p.health === 'At Risk' ? 'bg-warning text-dark' : 'bg-danger'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {p.health}
                    </span>
                  </div>

                  <div className="progress mt-2" style={{ height: '5px' }}>
                    <div className="progress-bar" style={{ width: `${p.progress_percentage}%`, backgroundColor: p.color }}></div>
                  </div>
                  <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                    <span>{p.completed_tasks_count} / {p.tasks_count} done</span>
                    <span>{p.progress_percentage}%</span>
                  </div>
                </Link>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-4 text-muted small">No active projects.</div>
              )}
            </div>
          </div>
        </div>

        {/* RECENTLY UPDATED TASKS */}
        <div className="col-12 col-lg-8">
          <div className="tf-card overflow-hidden h-100">
            <div className="tf-card-header d-flex justify-content-between align-items-center">
              <span className="fw-bold small text-uppercase">Recent Deliverables</span>
              <Link to="/tasks" className="btn btn-sm btn-link text-primary p-0">
                All Tasks <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Done</th>
                    <th style={{ width: '90px' }}>Key</th>
                    <th>Title</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '100px' }}>Priority</th>
                    <th style={{ width: '120px' }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr
                      key={task.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleOpenTask(task.id)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={task.status === 'done'}
                          onChange={() => handleQuickStatusToggle(task)}
                        />
                      </td>
                      <td>
                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>
                          {task.task_key || `TASK-${task.id}`}
                        </span>
                      </td>
                      <td>
                        <div className={`fw-semibold text-truncate ${task.status === 'done' ? 'text-decoration-line-through text-muted' : ''}`} style={{ maxWidth: '280px' }}>
                          {task.title}
                        </div>
                        {task.is_blocked && (
                          <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>
                            BLOCKED
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={task.status} /></td>
                      <td><PriorityBadge priority={task.priority} /></td>
                      <td>
                        <span className={`small ${task.is_overdue ? 'text-danger fw-bold' : 'text-muted'}`}>
                          {task.due_date || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {recentTasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted small">No recent tasks.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
