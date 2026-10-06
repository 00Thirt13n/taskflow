import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TaskCreateModal({ isOpen, onClose, onTaskCreated, defaultProjectId = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  // AI Natural Language input
  const [nlpPrompt, setNlpPrompt] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [showNlpInput, setShowNlpInput] = useState(false);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadFormData();
      setErrors({});
      setShowNlpInput(false);
      setNlpPrompt('');
      if (defaultProjectId) setProjectId(defaultProjectId);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultProjectId]);

  const loadFormData = async () => {
    try {
      const projs = await projectService.getProjects();
      setProjects(projs || []);

      const activeProjId = defaultProjectId || (projs && projs.length > 0 ? projs[0].id : '');
      if (!projectId && activeProjId) {
        setProjectId(activeProjId);
      }

      let usrList = [];
      if (isAdmin) {
        usrList = await adminService.getUsers().catch(() => []);
      } else if (activeProjId) {
        usrList = await projectService.getMembers(activeProjId).catch(() => []);
        if (!usrList || usrList.length === 0) {
          usrList = user ? [user] : [];
        }
      } else if (user) {
        usrList = [user];
      }

      setUsers(usrList || []);
      if (!assigneeId && user) {
        setAssigneeId(user.id);
      }
    } catch (err) {
      console.error('Failed to load form options:', err);
    }
  };

  const handleProjectChange = async (newProjId) => {
    setProjectId(newProjId);
    if (!isAdmin && newProjId) {
      try {
        const members = await projectService.getMembers(newProjId);
        if (members && members.length > 0) {
          setUsers(members);
        } else if (user) {
          setUsers([user]);
        }
      } catch {
        if (user) setUsers([user]);
      }
    }
  };

  const handleNlpParse = async () => {
    if (!nlpPrompt.trim()) return;
    setIsAiParsing(true);
    try {
      const parsed = await taskService.parseNaturalTaskAi(nlpPrompt.trim());
      if (parsed.title) setTitle(parsed.title);
      if (parsed.priority) setPriority(parsed.priority);
      if (parsed.due_date) setDueDate(parsed.due_date);
      if (parsed.suggested_assignee) {
        const matched = users.find((u) =>
          u.name.toLowerCase().includes(parsed.suggested_assignee.toLowerCase())
        );
        if (matched) setAssigneeId(matched.id);
      }
      addToast('Parsed natural language into task fields', 'success');
      setShowNlpInput(false);
    } catch (err) {
      addToast('Failed to parse text via AI', 'danger');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDate || null,
        project_id: projectId ? parseInt(projectId, 10) : null,
        assignee_id: assigneeId ? parseInt(assigneeId, 10) : null,
        estimated_minutes: estimatedHours ? Math.round(parseFloat(estimatedHours) * 60) : null,
      };

      const res = await taskService.createTask(payload);
      addToast('Task created successfully', 'success');
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setEstimatedHours('');
      onTaskCreated?.(res.task);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        addToast(err.response?.data?.message || 'Failed to create task', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-create-modal-title"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content shadow-lg border-0" style={{ backgroundColor: 'var(--tf-bg-surface)', borderColor: 'var(--tf-border)' }}>
          {/* Header */}
          <div className="modal-header border-bottom py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-plus-circle text-primary fs-5" aria-hidden="true"></i>
              <h5 id="task-create-modal-title" className="modal-title fw-bold">Create New Task</h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => setShowNlpInput(!showNlpInput)}
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-stars text-warning"></i>
                <span>{showNlpInput ? 'Manual Form' : 'AI Quick Prompt'}</span>
              </button>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3">
              {/* Natural Language Prompt Bar */}
              {showNlpInput && (
                <div className="p-3 bg-light rounded border" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    AI Natural Language Creator
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Finish API security review by Friday, high priority, assign to Elena"
                      value={nlpPrompt}
                      onChange={(e) => setNlpPrompt(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={handleNlpParse}
                      disabled={isAiParsing}
                    >
                      <i className="bi bi-magic"></i>
                      <span>{isAiParsing ? 'Parsing...' : 'Parse'}</span>
                    </button>
                  </div>
                  <div className="form-text" style={{ fontSize: '0.7rem' }}>
                    Type your request in plain English. The AI parses title, priority, due date, and assignee automatically.
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="form-label small fw-semibold">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
              </div>

              {/* Project & Assignee row */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Project</label>
                  <select
                    className="form-select"
                    value={projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                  >
                    <option value="">No Project (General)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.key} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Assignee</label>
                  <select
                    className="form-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status, Priority, Due Date row */}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Estimated Effort (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 4.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide context, acceptance criteria, or technical details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top py-3">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
