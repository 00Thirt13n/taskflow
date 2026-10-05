import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

export default function MyWorkPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyWork();
  }, []);

  const loadMyWork = async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        assignee_id: user?.id,
        view_mode: 'all',
      });
      setTasks(res.data || res || []);
    } catch (err) {
      addToast('Failed to load my work items', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTask = (taskId) => {
    setSearchParams({ task: String(taskId) });
  };

  const handleToggleDone = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      await taskService.updateStatus(task.id, nextStatus);
      addToast(`Task marked as ${nextStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'danger');
      loadMyWork();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.due_date && t.due_date < todayStr
  );
  const todayTasks = tasks.filter(
    (t) => t.status !== 'done' && t.due_date === todayStr
  );
  const upcomingTasks = tasks.filter(
    (t) => t.status !== 'done' && (!t.due_date || t.due_date > todayStr)
  );
  const completedTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>My Work</h2>
          <p className="text-muted small mb-0">
            Focused workspace for items assigned directly to you.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading assignments...
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {/* SECTION: OVERDUE ALERTS */}
          {overdueTasks.length > 0 && (
            <div className="tf-card border-danger">
              <div className="tf-card-header bg-danger-subtle text-danger fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-octagon-fill"></i>
                <span>Overdue Deliverables ({overdueTasks.length})</span>
              </div>
              <div className="p-0">
                <ul className="list-group list-group-flush">
                  {overdueTasks.map((t) => (
                    <li
                      key={t.id}
                      className="list-group-item d-flex align-items-center justify-content-between p-3"
                      style={{ cursor: 'pointer', backgroundColor: 'var(--tf-bg-surface)' }}
                      onClick={() => handleOpenTask(t.id)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={t.status === 'done'}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleDone(t);
                          }}
                        />
                        <div>
                          <span className="badge bg-secondary font-monospace me-2" style={{ fontSize: '0.7rem' }}>
                            {t.task_key}
                          </span>
                          <span className="fw-semibold text-danger">{t.title}</span>
                          {t.project && (
                            <span className="text-muted small ms-2">({t.project.name})</span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <span className="badge bg-danger">Due: {t.due_date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION: TODAY */}
          <div className="tf-card">
            <div className="tf-card-header d-flex align-items-center justify-content-between">
              <div className="fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-sun text-warning"></i>
                <span>Due Today ({todayTasks.length})</span>
              </div>
            </div>
            <div className="p-0">
              <ul className="list-group list-group-flush">
                {todayTasks.map((t) => (
                  <li
                    key={t.id}
                    className="list-group-item d-flex align-items-center justify-content-between p-3"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--tf-bg-surface)' }}
                    onClick={() => handleOpenTask(t.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked={t.status === 'done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleDone(t);
                        }}
                      />
                      <div>
                        <span className="badge bg-secondary font-monospace me-2" style={{ fontSize: '0.7rem' }}>
                          {t.task_key}
                        </span>
                        <span className="fw-semibold">{t.title}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
                {todayTasks.length === 0 && (
                  <div className="p-4 text-center text-muted small">
                    No tasks due today. Nice work!
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* SECTION: UPCOMING */}
          <div className="tf-card">
            <div className="tf-card-header d-flex align-items-center justify-content-between">
              <div className="fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-calendar-event text-primary"></i>
                <span>Upcoming Tasks ({upcomingTasks.length})</span>
              </div>
            </div>
            <div className="p-0">
              <ul className="list-group list-group-flush">
                {upcomingTasks.map((t) => (
                  <li
                    key={t.id}
                    className="list-group-item d-flex align-items-center justify-content-between p-3"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--tf-bg-surface)' }}
                    onClick={() => handleOpenTask(t.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked={t.status === 'done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleDone(t);
                        }}
                      />
                      <div>
                        <span className="badge bg-secondary font-monospace me-2" style={{ fontSize: '0.7rem' }}>
                          {t.task_key}
                        </span>
                        <span className="fw-semibold">{t.title}</span>
                        {t.project && (
                          <span className="text-muted small ms-2">({t.project.name})</span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {t.due_date && <span className="small text-muted">Due: {t.due_date}</span>}
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION: COMPLETED */}
          <div className="tf-card">
            <div className="tf-card-header text-muted fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill text-success"></i>
              <span>Completed ({completedTasks.length})</span>
            </div>
            <div className="p-0">
              <ul className="list-group list-group-flush">
                {completedTasks.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="list-group-item d-flex align-items-center justify-content-between p-3 text-muted"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--tf-bg-surface)' }}
                    onClick={() => handleOpenTask(t.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleDone(t);
                        }}
                      />
                      <span className="text-decoration-line-through">{t.title}</span>
                    </div>
                    <span className="badge bg-success-subtle text-success">Done</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
