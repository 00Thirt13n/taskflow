import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('folder');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      addToast('Failed to load projects', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    setIsSubmitting(true);
    try {
      await projectService.createProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || null,
        color,
        icon,
        target_date: targetDate || null,
      });
      addToast('Project created successfully', 'success');
      setShowCreateModal(false);
      setName('');
      setKey('');
      setDescription('');
      setTargetDate('');
      loadProjects();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHealthBadge = (health) => {
    if (health === 'Delayed') return <span className="badge-health-delayed">Delayed</span>;
    if (health === 'At Risk') return <span className="badge-health-risk">At Risk</span>;
    return <span className="badge-health-healthy">Healthy</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Projects</h2>
          <p className="text-muted small mb-0">
            Work streams, initiatives, and deliverables.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading projects...
        </div>
      ) : (
        <div className="row g-3">
          {projects.map((proj) => (
            <div key={proj.id} className="col-12 col-md-6 col-xl-4">
              <Link
                to={`/projects/${proj.id}`}
                className="tf-card d-block p-4 text-decoration-none h-100"
                style={{ color: 'inherit' }}
              >
                {/* Project Header */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded d-flex align-items-center justify-content-center text-white"
                      style={{ width: '36px', height: '36px', backgroundColor: proj.color || '#6366f1' }}
                    >
                      <i className={`bi bi-${proj.icon || 'folder'} fs-6`}></i>
                    </div>
                    <div>
                      <div className="fw-bold text-truncate" style={{ maxWidth: '170px' }}>
                        {proj.name}
                      </div>
                      <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.68rem' }}>
                        {proj.key}
                      </span>
                    </div>
                  </div>
                  <div>{getHealthBadge(proj.health)}</div>
                </div>

                {/* Description */}
                <p className="text-muted small mb-3 text-truncate-2" style={{ minHeight: '38px', fontSize: '0.8125rem' }}>
                  {proj.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Progress</span>
                    <span className="fw-semibold">{proj.progress_percentage}%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${proj.progress_percentage}%`,
                        backgroundColor: proj.color || 'var(--tf-primary)',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top text-muted small" style={{ fontSize: '0.75rem' }}>
                  <div>
                    <span className="fw-semibold text-main">{proj.completed_tasks_count}</span>
                    <span className="text-muted"> / {proj.tasks_count} tasks</span>
                  </div>
                  {proj.target_date && (
                    <div>
                      <i className="bi bi-flag me-1"></i>
                      <span>Target: {proj.target_date}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              No projects created yet. Click "New Project" to start one!
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold">Create Project</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>

              <form onSubmit={handleCreateProject}>
                <div className="modal-body p-4 d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-semibold">Project Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Website Redesign"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!key) {
                          setKey(e.target.value.substring(0, 3).toUpperCase());
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Project Key (Prefix) <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="e.g. WEB"
                        maxLength="6"
                        value={key}
                        onChange={(e) => setKey(e.target.value.toUpperCase())}
                        required
                      />
                      <div className="form-text" style={{ fontSize: '0.68rem' }}>Used for task keys (e.g. {key || 'PRJ'}-101)</div>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Color Accent</label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold">Target Completion Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="High-level goal and scope of this project..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top py-3">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
