import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';

export default function TaskFormModal({ isOpen, onClose, onSave, task = null, users = [], isAdmin = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    user_id: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.substring(0, 10) : '',
        user_id: task.user_id ? String(task.user_id) : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        user_id: '',
      });
    }
    setErrors({});
    setAiSuggestion(null);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAiSuggest = async () => {
    if (!formData.title || formData.title.trim().length < 3) {
      setErrors((prev) => ({ ...prev, title: ['Enter a descriptive title first to enable AI classification.'] }));
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const suggestion = await taskService.suggestAi(formData.title, formData.description);
      setAiSuggestion(suggestion);
      showToast('AI analysis completed.', 'info');
    } catch {
      showToast('AI service currently unavailable; falling back to manual entry.', 'warning');
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;

    setFormData((prev) => ({
      ...prev,
      priority: aiSuggestion.priority || prev.priority,
      description: prev.description
        ? `${prev.description}\n\n[AI Tag: ${aiSuggestion.category} | ${aiSuggestion.estimated_urgency}]`
        : `Category: ${aiSuggestion.category} | Urgency: ${aiSuggestion.estimated_urgency}`,
    }));

    showToast('Applied AI suggestions to form.', 'success');
    setAiSuggestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
      };

      if (isAdmin && formData.user_id) {
        payload.user_id = parseInt(formData.user_id, 10);
      }

      await onSave(payload, task?.id);
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        showToast(err.response?.data?.message || 'Failed to save task. Please try again.', 'danger');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content border-0 shadow-lg">
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                <i className={`bi ${task ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-primary'}`}></i>
                <span>{task ? 'Edit Task' : 'Create New Task'}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close modal"
                onClick={onClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <div className="modal-body p-4">
              {/* Title */}
              <div className="mb-3">
                <label htmlFor="taskTitle" className="form-label fw-semibold small text-dark">
                  Task Title <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    id="taskTitle"
                    name="title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="e.g. Deploy production release and verify API health"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-1"
                    onClick={handleAiSuggest}
                    disabled={isAiLoading || isSubmitting}
                    title="Let AI categorize and suggest priority for this task"
                  >
                    {isAiLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-stars text-warning"></i>
                    )}
                    <span className="d-none d-sm-inline">AI Assistant</span>
                  </button>
                </div>
                {errors.title && <div className="invalid-feedback d-block">{errors.title[0]}</div>}
              </div>

              {/* AI Suggestion Preview Box */}
              {aiSuggestion && (
                <div className="card mb-3 border-primary bg-primary-subtle p-3">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-bold small text-primary d-flex align-items-center gap-1">
                        <i className="bi bi-robot"></i> AI Classification Preview ({aiSuggestion.source})
                      </div>
                      <div className="small text-dark mt-1">
                        <strong>Priority:</strong> <span className="badge bg-danger ms-1 text-uppercase">{aiSuggestion.priority}</span>
                        <strong className="ms-3">Category:</strong> <span className="badge bg-secondary ms-1">{aiSuggestion.category}</span>
                        <strong className="ms-3">Urgency:</strong> <span className="text-muted ms-1">{aiSuggestion.estimated_urgency}</span>
                      </div>
                      {aiSuggestion.suggested_tags?.length > 0 && (
                        <div className="small text-muted mt-1">
                          Tags: {aiSuggestion.suggested_tags.map((tag) => (
                            <span key={tag} className="badge bg-light text-dark border me-1">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-2 py-1"
                        onClick={applyAiSuggestion}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-2 py-1"
                        onClick={() => setAiSuggestion(null)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="taskDescription" className="form-label fw-semibold small text-dark">
                  Description
                </label>
                <textarea
                  id="taskDescription"
                  name="description"
                  rows="3"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Additional context, acceptance criteria, or execution notes..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                {errors.description && <div className="invalid-feedback d-block">{errors.description[0]}</div>}
              </div>

              {/* Row: Status, Priority, Due Date */}
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label htmlFor="taskStatus" className="form-label fw-semibold small text-dark">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    id="taskStatus"
                    name="status"
                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                  {errors.status && <div className="invalid-feedback d-block">{errors.status[0]}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="taskPriority" className="form-label fw-semibold small text-dark">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    id="taskPriority"
                    name="priority"
                    className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.priority && <div className="invalid-feedback d-block">{errors.priority[0]}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="taskDueDate" className="form-label fw-semibold small text-dark">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="taskDueDate"
                    name="due_date"
                    className={`form-control ${errors.due_date ? 'is-invalid' : ''}`}
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                  {errors.due_date && <div className="invalid-feedback d-block">{errors.due_date[0]}</div>}
                </div>
              </div>

              {/* Admin-only owner assignment */}
              {isAdmin && users.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <label htmlFor="taskOwner" className="form-label fw-semibold small text-dark">
                    Assign Owner (Admin Override)
                  </label>
                  <select
                    id="taskOwner"
                    name="user_id"
                    className="form-select"
                    value={formData.user_id}
                    onChange={handleChange}
                  >
                    <option value="">Assign to me (current admin)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                <span>{task ? 'Update Task' : 'Create Task'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
