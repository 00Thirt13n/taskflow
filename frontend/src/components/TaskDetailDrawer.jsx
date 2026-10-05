import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TaskDetailDrawer({ taskId, onClose, onTaskUpdated }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, discussion, activity
  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [blockerReasonInput, setBlockerReasonInput] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (taskId) {
      loadTaskDetails(taskId);
    }
  }, [taskId]);

  const loadTaskDetails = async (id) => {
    setLoading(true);
    try {
      const data = await taskService.getTask(id);
      setTask(data);
    } catch (err) {
      addToast('Failed to load task details', 'danger');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!taskId) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      await taskService.updateStatus(task.id, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
      addToast(`Status updated to ${newStatus}`, 'success');
      onTaskUpdated?.();
    } catch (err) {
      addToast('Failed to update status', 'danger');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await taskService.updateTask(task.id, { priority: newPriority });
      setTask((prev) => ({ ...prev, priority: newPriority }));
      addToast(`Priority changed to ${newPriority}`, 'success');
      onTaskUpdated?.();
    } catch (err) {
      addToast('Failed to update priority', 'danger');
    }
  };

  const handleToggleBlocker = async () => {
    try {
      const newBlocked = !task.is_blocked;
      await taskService.toggleBlocker(task.id, newBlocked, newBlocked ? blockerReasonInput : null);
      setTask((prev) => ({
        ...prev,
        is_blocked: newBlocked,
        blocker_reason: newBlocked ? blockerReasonInput : null,
      }));
      setShowBlockerInput(false);
      setBlockerReasonInput('');
      addToast(newBlocked ? 'Task flagged as blocked' : 'Task unblocked', 'warning');
      onTaskUpdated?.();
    } catch (err) {
      addToast('Failed to update blocker status', 'danger');
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await taskService.addSubtask(task.id, newSubtaskTitle.trim());
      setTask((prev) => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), res.subtask],
        subtasks_count: (prev.subtasks_count || 0) + 1,
      }));
      setNewSubtaskTitle('');
      addToast('Subtask added', 'success');
      onTaskUpdated?.();
    } catch (err) {
      addToast('Failed to add subtask', 'danger');
    }
  };

  const handleToggleSubtask = async (subtask) => {
    try {
      const nextStatus = subtask.status === 'done' ? 'todo' : 'done';
      await taskService.updateStatus(subtask.id, nextStatus);
      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((st) =>
          st.id === subtask.id ? { ...st, status: nextStatus } : st
        ),
      }));
      onTaskUpdated?.();
    } catch (err) {
      addToast('Failed to update subtask', 'danger');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await taskService.addComment(task.id, commentText.trim());
      setTask((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.comment],
      }));
      setCommentText('');
      addToast('Comment posted', 'success');
    } catch (err) {
      addToast('Failed to post comment', 'danger');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(task.id, commentId);
      setTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
      addToast('Comment deleted', 'info');
    } catch (err) {
      addToast('Failed to remove comment', 'danger');
    }
  };

  // AI Actions
  const handleAiImproveDescription = async () => {
    setIsAiLoading(true);
    try {
      const improved = await taskService.improveDescriptionAi(task.title, task.description);
      if (improved) {
        await taskService.updateTask(task.id, { description: improved });
        setTask((prev) => ({ ...prev, description: improved }));
        addToast('AI enhanced description and criteria', 'success');
        onTaskUpdated?.();
      }
    } catch (err) {
      addToast('AI improvement service unavailable', 'danger');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerateSubtasks = async () => {
    setIsAiLoading(true);
    try {
      const titles = await taskService.generateSubtasksAi(task.title, task.description);
      if (Array.isArray(titles)) {
        for (const title of titles) {
          const res = await taskService.addSubtask(task.id, title);
          setTask((prev) => ({
            ...prev,
            subtasks: [...(prev.subtasks || []), res.subtask],
          }));
        }
        addToast(`AI generated ${titles.length} subtasks`, 'success');
        onTaskUpdated?.();
      }
    } catch (err) {
      addToast('AI subtask generation unavailable', 'danger');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="task-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.8125rem' }}>
              {task?.task_key || `TASK-${taskId}`}
            </span>
            {task?.project && (
              <span
                className="badge"
                style={{
                  backgroundColor: `${task.project.color}20`,
                  color: task.project.color,
                  border: `1px solid ${task.project.color}40`,
                }}
              >
                {task.project.name}
              </span>
            )}
          </div>
          <button className="btn btn-sm btn-link text-muted" onClick={onClose} aria-label="Close drawer">
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 small">Loading task details...</div>
          </div>
        ) : task ? (
          <div className="drawer-body">
            {/* Blocker Alert Banner */}
            {task.is_blocked && (
              <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-0 border-0 rounded shadow-sm">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.875rem' }}>TASK IS BLOCKED</div>
                    <div className="small text-danger-emphasis">{task.blocker_reason || 'Waiting for resolution.'}</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger bg-white" onClick={handleToggleBlocker}>
                  Resolve Blocker
                </button>
              </div>
            )}

            {/* Task Title */}
            <div>
              <h4 className="fw-bold mb-3">{task.title}</h4>

              {/* Status, Priority, Due Date, Assignee Strip */}
              <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                {/* Status Selector */}
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>STATUS</div>
                  <select
                    className="form-select form-select-sm"
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>PRIORITY</div>
                  <select
                    className="form-select form-select-sm"
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>ASSIGNEE</div>
                  <div className="d-flex align-items-center gap-1 mt-1 small">
                    <div className="avatar-circle" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                      {task.assignee ? task.assignee.name[0] : 'U'}
                    </div>
                    <span>{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: '0.7rem' }}>DUE DATE</div>
                  <div className={`small mt-1 ${task.is_overdue ? 'text-danger fw-bold' : ''}`}>
                    <i className="bi bi-calendar3 me-1"></i>
                    {task.due_date || 'No due date'}
                    {task.is_overdue && ' (Overdue)'}
                  </div>
                </div>

                {/* Blocker Action */}
                {!task.is_blocked && (
                  <div className="ms-auto align-self-end">
                    {!showBlockerInput ? (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => setShowBlockerInput(true)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="bi bi-flag me-1"></i>Mark as Blocked
                      </button>
                    ) : (
                      <div className="d-flex gap-1">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Reason for blocker..."
                          value={blockerReasonInput}
                          onChange={(e) => setBlockerReasonInput(e.target.value)}
                          style={{ width: '160px' }}
                        />
                        <button className="btn btn-sm btn-warning" onClick={handleToggleBlocker}>
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-bottom d-flex gap-4">
              <button
                className={`btn btn-link text-decoration-none px-0 pb-2 ${
                  activeTab === 'overview' ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-muted'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`btn btn-link text-decoration-none px-0 pb-2 ${
                  activeTab === 'discussion' ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-muted'
                }`}
                onClick={() => setActiveTab('discussion')}
              >
                Discussion ({task.comments?.length || 0})
              </button>
              <button
                className={`btn btn-link text-decoration-none px-0 pb-2 ${
                  activeTab === 'activity' ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-muted'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity Feed ({task.activity_logs?.length || 0})
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="d-flex flex-column gap-4">
                {/* Description */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold small text-muted text-uppercase">Description</span>
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={handleAiImproveDescription}
                      disabled={isAiLoading}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <i className="bi bi-stars text-warning"></i>
                      <span>{isAiLoading ? 'Improving...' : 'AI Enhance'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-light rounded border text-muted" style={{ minHeight: '80px', whiteSpace: 'pre-wrap', backgroundColor: 'var(--tf-bg-subtle)' }}>
                    {task.description || 'No description provided yet.'}
                  </div>
                </div>

                {/* Subtasks Section */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold small text-muted text-uppercase">
                      Subtasks ({task.subtasks?.filter((s) => s.status === 'done').length || 0}/{task.subtasks?.length || 0})
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={handleAiGenerateSubtasks}
                      disabled={isAiLoading}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <i className="bi bi-robot text-primary"></i>
                      <span>{isAiLoading ? 'Generating...' : 'AI Subtasks'}</span>
                    </button>
                  </div>

                  {/* Subtask items list */}
                  <div className="d-flex flex-column gap-1 mb-2">
                    {task.subtasks?.map((st) => (
                      <div
                        key={st.id}
                        className="d-flex align-items-center gap-2 p-2 rounded hover-bg"
                        style={{ borderBottom: '1px solid var(--tf-border-subtle)' }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-0 cursor-pointer"
                          checked={st.status === 'done'}
                          onChange={() => handleToggleSubtask(st)}
                        />
                        <span className={`small flex-grow-1 ${st.status === 'done' ? 'text-decoration-line-through text-muted' : ''}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add subtask input */}
                  <form onSubmit={handleAddSubtask} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Add a new subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    />
                    <button type="submit" className="btn btn-sm btn-outline-primary">
                      Add
                    </button>
                  </form>
                </div>

                {/* Dependencies / Blockers */}
                {task.blocked_by && task.blocked_by.length > 0 && (
                  <div>
                    <span className="fw-semibold small text-muted text-uppercase mb-2 d-block">Blocked By</span>
                    <div className="d-flex flex-wrap gap-2">
                      {task.blocked_by.map((dep) => (
                        <span key={dep.id} className="badge bg-danger-subtle text-danger border border-danger-subtle p-2">
                          <i className="bi bi-link-45deg me-1"></i>
                          {dep.task_key}: {dep.title} ({dep.status})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: DISCUSSION */}
            {activeTab === 'discussion' && (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-column gap-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {task.comments?.map((c) => (
                    <div key={c.id} className="p-3 bg-light rounded border" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                            {c.user?.name ? c.user.name[0] : 'U'}
                          </div>
                          <span className="fw-semibold small">{c.user?.name}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        {(user?.id === c.user?.id || user?.is_admin) && (
                          <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Delete comment"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      <div className="small text-break ps-4">{c.body}</div>
                    </div>
                  ))}

                  {(!task.comments || task.comments.length === 0) && (
                    <div className="text-center py-4 text-muted small">
                      No comments yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="d-flex flex-column gap-2 mt-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    placeholder="Write a comment or mention @team..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  ></textarea>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary btn-sm px-3">
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ACTIVITY FEED */}
            {activeTab === 'activity' && (
              <div className="d-flex flex-column gap-3">
                {task.activity_logs?.map((act) => (
                  <div key={act.id} className="d-flex gap-2 small">
                    <i className="bi bi-circle-fill text-muted mt-1" style={{ fontSize: '0.45rem' }}></i>
                    <div>
                      <span className="fw-semibold">{act.user?.name || 'System'}</span>
                      <span className="text-muted ms-1">
                        {act.action === 'status_changed' && `moved task to ${act.new_value}`}
                        {act.action === 'created' && 'created this task'}
                        {act.action === 'updated' && `updated ${act.field}`}
                        {act.action === 'comment_added' && 'added a comment'}
                        {act.action === 'blocked' && `flagged task as blocked: ${act.new_value}`}
                        {act.action === 'unblocked' && 'cleared task blocker'}
                      </span>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                        {act.created_at ? new Date(act.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                ))}

                {(!task.activity_logs || task.activity_logs.length === 0) && (
                  <div className="text-center py-4 text-muted small">
                    No activity recorded yet.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
