import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TaskFormModal from '../components/TaskFormModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    high_priority: 0,
    overdue: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ per_page: 5, sort_by: 'created_at', sort_order: 'desc' }),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.data || []);
    } catch {
      showToast('Failed to load dashboard metrics.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateTask = async (data) => {
    await taskService.createTask(data);
    showToast('Task created successfully.', 'success');
    fetchDashboardData();
  };

  const handleQuickStatusToggle = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await taskService.updateStatus(task.id, nextStatus);
      showToast(`Task marked as ${nextStatus === 'done' ? 'completed' : 'to do'}.`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to update task status.', 'danger');
    }
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            Welcome back, {user?.name}
          </h2>
          <p className="text-muted small mb-0">
            Here is your daily task distribution and upcoming deadlines overview.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Task</span>
        </button>
      </div>

      {/* Overdue Warning Alert if any overdue tasks exist */}
      {stats.overdue > 0 && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-octagon-fill fs-4 text-danger"></i>
            <div>
              <strong className="d-block">Attention Required: {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}!</strong>
              <span className="small text-danger-emphasis">Some tasks have exceeded their scheduled due dates.</span>
            </div>
          </div>
          <Link to="/tasks?status=todo" className="btn btn-danger btn-sm text-nowrap">
            Review Overdue
          </Link>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">Total Tasks</div>
            <div className="fs-3 fw-bold text-dark mt-1">{loading ? '—' : stats.total}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-layers text-primary me-1"></i> Active scope
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">To Do</div>
            <div className="fs-3 fw-bold text-secondary mt-1">{loading ? '—' : stats.todo}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-clock text-secondary me-1"></i> Not started
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">In Progress</div>
            <div className="fs-3 fw-bold text-primary mt-1">{loading ? '—' : stats.in_progress}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-arrow-repeat text-primary me-1"></i> In execution
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">Completed</div>
            <div className="fs-3 fw-bold text-success mt-1">{loading ? '—' : stats.done}</div>
            <div className="small text-success mt-auto pt-2">
              <i className="bi bi-check-circle-fill me-1"></i> {completionPercentage}% finished
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">High Priority</div>
            <div className="fs-3 fw-bold text-danger mt-1">{loading ? '—' : stats.high_priority}</div>
            <div className="small text-danger mt-auto pt-2">
              <i className="bi bi-fire me-1"></i> Critical focus
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="card p-3 h-100 card-hover">
            <div className="text-muted small fw-medium">Overdue</div>
            <div className="fs-3 fw-bold text-danger mt-1">{loading ? '—' : stats.overdue}</div>
            <div className="small text-muted mt-auto pt-2">
              <i className="bi bi-calendar-x text-danger me-1"></i> Past target
            </div>
          </div>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="card p-4 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small text-dark">Overall Task Completion Rate</span>
          <span className="fw-bold small text-primary">{completionPercentage}%</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${completionPercentage}%` }}
            aria-valuenow={completionPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary"></i> Recently Updated Tasks
          </h5>
          <Link to="/tasks" className="btn btn-outline-primary btn-sm">
            View All Tasks <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="p-4"><LoadingSkeleton count={3} /></div>
          ) : recentTasks.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-inbox fs-2 text-secondary mb-2 d-block"></i>
              No recent tasks found. Create your first task to get started!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th scope="col" style={{ width: '40px' }}>Done</th>
                    <th scope="col">Title</th>
                    <th scope="col">Status</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Due Date</th>
                    {isAdmin && <th scope="col">Owner</th>}
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={task.status === 'done'}
                          onChange={() => handleQuickStatusToggle(task)}
                          aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'incomplete' : 'completed'}`}
                        />
                      </td>
                      <td>
                        <div className={`fw-medium ${task.status === 'done' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '360px' }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        {task.due_date ? (
                          <span className={`small ${task.is_overdue ? 'badge badge-overdue' : 'text-secondary'}`}>
                            <i className="bi bi-calendar3 me-1"></i> {task.due_date}
                          </span>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          <span className="small text-dark fw-medium">
                            {task.user?.name || `User #${task.user_id}`}
                          </span>
                        </td>
                      )}
                      <td className="text-end">
                        <Link to="/tasks" className="btn btn-sm btn-link text-decoration-none">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
        isAdmin={isAdmin}
      />
    </div>
  );
}
