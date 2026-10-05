import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectAndTasks();
  }, [id]);

  const loadProjectAndTasks = async () => {
    setLoading(true);
    try {
      const [projData, taskRes] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks({ project_id: id, view_mode: 'all' }),
      ]);
      setProject(projData);
      setTasks(taskRes.data || taskRes || []);
    } catch (err) {
      addToast('Failed to load project details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTask = (taskId) => {
    setSearchParams({ task: String(taskId) });
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-5 text-muted">
        <h4>Project not found</h4>
        <Link to="/projects" className="btn btn-outline-primary btn-sm mt-3">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Project Banner Card */}
      <div className="tf-card mb-4 p-4 border-top border-4" style={{ borderTopColor: project.color || 'var(--tf-primary)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded d-flex align-items-center justify-content-center text-white flex-shrink-0"
              style={{ width: '48px', height: '48px', backgroundColor: project.color || 'var(--tf-primary)' }}
            >
              <i className={`bi bi-${project.icon || 'folder'} fs-4`}></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h3 className="fw-bold mb-0">{project.name}</h3>
                <span className="badge bg-secondary font-monospace">{project.key}</span>
                <span className={`badge ${
                  project.health === 'Healthy' ? 'bg-success' : project.health === 'At Risk' ? 'bg-warning text-dark' : 'bg-danger'
                }`}>
                  {project.health}
                </span>
              </div>
              <p className="text-muted small mb-2">{project.description || 'No description provided.'}</p>
              <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.75rem' }}>
                <span>Owner: <strong>{project.owner?.name}</strong></span>
                {project.target_date && <span>Target: <strong>{project.target_date}</strong></span>}
                <span>Members: <strong>{project.members_count}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ width: '220px' }}>
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Overall Progress</span>
              <span className="fw-bold">{project.progress_percentage}%</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar"
                style={{ width: `${project.progress_percentage}%`, backgroundColor: project.color || 'var(--tf-primary)' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="tf-card p-3 text-center">
            <div className="text-muted small text-uppercase">Total Tasks</div>
            <div className="fs-4 fw-bold">{project.tasks_count}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="tf-card p-3 text-center">
            <div className="text-muted small text-uppercase">Completed</div>
            <div className="fs-4 fw-bold text-success">{project.completed_tasks_count}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="tf-card p-3 text-center">
            <div className="text-muted small text-uppercase">In Progress</div>
            <div className="fs-4 fw-bold text-primary">{project.in_progress_tasks_count}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="tf-card p-3 text-center">
            <div className="text-muted small text-uppercase">Overdue</div>
            <div className={`fs-4 fw-bold ${project.overdue_tasks_count > 0 ? 'text-danger' : 'text-muted'}`}>
              {project.overdue_tasks_count}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tf-card overflow-hidden">
        <div className="tf-card-header d-flex justify-content-between align-items-center">
          <span className="fw-bold small text-uppercase">Project Deliverables ({tasks.length})</span>
          <Link to={`/tasks?project_id=${project.id}`} className="btn btn-sm btn-link text-primary p-0">
            Open in Task Views <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="tf-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Key</th>
                <th>Task Title</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '100px' }}>Priority</th>
                <th style={{ width: '140px' }}>Assignee</th>
                <th style={{ width: '120px' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenTask(t.id)}
                >
                  <td>
                    <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>
                      {t.task_key || `TASK-${t.id}`}
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: '420px' }}>
                      {t.title}
                    </div>
                    {t.is_blocked && (
                      <span className="badge bg-danger-subtle text-danger mt-1" style={{ fontSize: '0.65rem' }}>
                        BLOCKED
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td>
                    <div className="d-flex align-items-center gap-1 small text-truncate">
                      <div className="avatar-circle" style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>
                        {t.assignee ? t.assignee.name[0] : 'U'}
                      </div>
                      <span>{t.assignee?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`small ${t.is_overdue ? 'text-danger fw-bold' : 'text-muted'}`}>
                      {t.due_date || '—'}
                    </span>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    No tasks created for this project yet.
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
