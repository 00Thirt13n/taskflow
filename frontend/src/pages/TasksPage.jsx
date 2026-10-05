import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext();

  // Active View Mode: list, board, calendar, timeline
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'list');

  // Filters state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project_id') || '');
  const [quickPreset, setQuickPreset] = useState(searchParams.get('preset') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data states
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk selection
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Drag and Drop state
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Delete modal state
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load project list once
  useEffect(() => {
    projectService.getProjects()
      .then(setProjects)
      .catch((err) => console.error('Failed to load projects:', err));
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        view_mode: viewMode,
        page: currentPage,
        per_page: viewMode === 'list' ? 15 : 100,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.project_id = projectFilter;

      if (quickPreset === 'my-work') params.assignee_id = user?.id;
      if (quickPreset === 'overdue') params.overdue = 'true';
      if (quickPreset === 'this-week') params.this_week = 'true';
      if (quickPreset === 'blocked') params.is_blocked = 'true';

      const res = await taskService.getTasks(params);
      if (Array.isArray(res.data)) {
        setTasks(res.data);
        setMeta(res.meta || null);
      } else {
        setTasks(res || []);
      }
    } catch (err) {
      addToast('Failed to load tasks', 'danger');
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentPage, debouncedSearch, statusFilter, priorityFilter, projectFilter, quickPreset, user, addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, outletContext?.refreshTrigger]);

  // Sync view mode in URL
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    searchParams.set('view', mode);
    setSearchParams(searchParams);
  };

  const handleOpenTask = (taskId) => {
    searchParams.set('task', String(taskId));
    setSearchParams(searchParams);
  };

  // Quick Preset Selection
  const handlePresetChange = (preset) => {
    setQuickPreset(preset);
    setCurrentPage(1);
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(tasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedTaskIds.length === 0) return;
    try {
      await taskService.bulkAction(action, selectedTaskIds, value);
      addToast(`Updated ${selectedTaskIds.length} tasks`, 'success');
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (err) {
      addToast('Bulk action failed', 'danger');
    }
  };

  // Drag and drop handlers for Kanban Board
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!taskId) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await taskService.updateStatus(taskId, targetStatus);
      addToast(`Task moved to ${targetStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update task status. Reverting.', 'danger');
      fetchTasks();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTask.id);
      addToast('Task deleted successfully', 'success');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calYear = currentDate.getFullYear();
  const calMonth = currentDate.getMonth();
  const totalDays = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  return (
    <div>
      {/* Header with Title and View Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Tasks</h2>
          <p className="text-muted small mb-0">
            Work items across all active workspace projects.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="btn-group shadow-sm bg-surface p-1 border rounded" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => handleViewModeChange('list')}
            title="Table View"
          >
            <i className="bi bi-table me-1"></i> List
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => handleViewModeChange('board')}
            title="Kanban Board View"
          >
            <i className="bi bi-kanban me-1"></i> Board
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => handleViewModeChange('calendar')}
            title="Calendar View"
          >
            <i className="bi bi-calendar3 me-1"></i> Calendar
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => handleViewModeChange('timeline')}
            title="Timeline / Gantt View"
          >
            <i className="bi bi-bar-chart-steps me-1"></i> Timeline
          </button>
        </div>
      </div>

      {/* Filter and Presets Bar */}
      <div className="tf-card mb-4 p-3">
        <div className="row g-2 align-items-center">
          {/* Search box */}
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Project Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Preset Buttons */}
          <div className="col-12 col-md-3 d-flex gap-1 justify-content-md-end flex-wrap">
            <button
              className={`btn btn-sm ${quickPreset === 'my-work' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handlePresetChange(quickPreset === 'my-work' ? '' : 'my-work')}
              style={{ fontSize: '0.75rem' }}
            >
              My Tasks
            </button>
            <button
              className={`btn btn-sm ${quickPreset === 'overdue' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => handlePresetChange(quickPreset === 'overdue' ? '' : 'overdue')}
              style={{ fontSize: '0.75rem' }}
            >
              Overdue
            </button>
            <button
              className={`btn btn-sm ${quickPreset === 'blocked' ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => handlePresetChange(quickPreset === 'blocked' ? '' : 'blocked')}
              style={{ fontSize: '0.75rem' }}
            >
              Blocked
            </button>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedTaskIds.length > 0 && (
          <div className="d-flex align-items-center justify-content-between p-2 mt-3 bg-light rounded border small">
            <div className="fw-semibold">
              <i className="bi bi-check2-square text-primary me-2"></i>
              {selectedTaskIds.length} tasks selected
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: '130px' }}
                onChange={(e) => e.target.value && handleBulkAction('status', e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Set Status...</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: '130px' }}
                onChange={(e) => e.target.value && handleBulkAction('priority', e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Set Priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleBulkAction('delete')}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: DENSE TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="tf-card overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon="bi-list-task"
              title="No tasks match the filter"
              message="Try changing the status, priority, or search filters above."
            />
          ) : (
            <div className="table-responsive">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th style={{ width: '38px' }} className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        onChange={handleSelectAll}
                        checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                      />
                    </th>
                    <th style={{ width: '90px' }}>Key</th>
                    <th>Title & Project</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '100px' }}>Priority</th>
                    <th style={{ width: '130px' }}>Assignee</th>
                    <th style={{ width: '120px' }}>Due Date</th>
                    <th style={{ width: '80px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <tr
                        key={task.id}
                        className={isSelected ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenTask(task.id)}
                      >
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={isSelected}
                            onChange={() => handleSelectTask(task.id)}
                          />
                        </td>
                        <td>
                          <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.75rem' }}>
                            {task.task_key || `TASK-${task.id}`}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold text-truncate" style={{ maxWidth: '380px' }}>
                              {task.title}
                            </span>
                            {task.is_blocked && (
                              <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-flag-fill me-1"></i>BLOCKED
                              </span>
                            )}
                          </div>
                          {task.project && (
                            <div className="d-flex align-items-center gap-1 mt-1 text-muted" style={{ fontSize: '0.72rem' }}>
                              <span
                                className="rounded-circle d-inline-block"
                                style={{ width: '6px', height: '6px', backgroundColor: task.project.color }}
                              ></span>
                              <span>{task.project.name}</span>
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
                          <div className="d-flex align-items-center gap-1 small text-truncate">
                            <div className="avatar-circle" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                              {task.assignee ? task.assignee.name[0] : 'U'}
                            </div>
                            <span className="text-truncate">{task.assignee?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td>
                          {task.due_date ? (
                            <span className={`small ${task.is_overdue ? 'text-danger fw-bold' : 'text-muted'}`}>
                              <i className="bi bi-calendar3 me-1"></i>{task.due_date}
                            </span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => setDeletingTask(task)}
                            title="Delete task"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <div className="p-3 border-top">
              <Pagination meta={meta} onPageChange={(p) => setCurrentPage(p)} />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DRAG-AND-DROP KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="kanban-board">
          {['todo', 'in-progress', 'done'].map((columnStatus) => {
            const colTasks = tasks.filter((t) => t.status === columnStatus);
            const isColOver = dragOverColumn === columnStatus;

            return (
              <div
                key={columnStatus}
                className={`kanban-column ${isColOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, columnStatus)}
                onDrop={(e) => handleDrop(e, columnStatus)}
              >
                {/* Column Header */}
                <div className="kanban-column-header">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      {columnStatus === 'todo' && 'To Do'}
                      {columnStatus === 'in-progress' && 'In Progress'}
                      {columnStatus === 'done' && 'Done'}
                    </span>
                    <span className="badge rounded-pill bg-secondary" style={{ fontSize: '0.7rem' }}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="kanban-column-tasks">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => handleOpenTask(t.id)}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.7rem' }}>
                          {t.task_key || `TASK-${t.id}`}
                        </span>
                        <PriorityBadge priority={t.priority} />
                      </div>

                      <div className="fw-semibold small mb-2 text-truncate" style={{ maxWidth: '280px' }}>
                        {t.title}
                      </div>

                      {t.is_blocked && (
                        <div className="badge bg-danger-subtle text-danger mb-2 p-1 w-100 text-start">
                          <i className="bi bi-flag-fill me-1"></i>BLOCKED: {t.blocker_reason || 'Pending resolution'}
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top text-muted" style={{ fontSize: '0.7rem' }}>
                        <div className="d-flex align-items-center gap-1">
                          <div className="avatar-circle" style={{ width: '18px', height: '18px', fontSize: '0.6rem' }}>
                            {t.assignee ? t.assignee.name[0] : 'U'}
                          </div>
                          <span>{t.assignee?.name || 'Unassigned'}</span>
                        </div>

                        {t.due_date && (
                          <span className={t.is_overdue ? 'text-danger fw-bold' : ''}>
                            <i className="bi bi-clock me-1"></i>{t.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-4 text-muted small border border-dashed rounded p-3">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: INTERACTIVE MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-header">
            <h5 className="fw-bold mb-0">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h5>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setCurrentDate(new Date(calYear, calMonth - 1, 1))}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setCurrentDate(new Date(calYear, calMonth + 1, 1))}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}

            {/* Empty offset days */}
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-cell other-month"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasks.filter((t) => t.due_date === dateStr);
              const isToday = new Date().toDateString() === new Date(calYear, calMonth, dayNum).toDateString();

              return (
                <div key={dayNum} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                  <div className="calendar-cell-date">{dayNum}</div>
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="calendar-task-chip"
                      onClick={() => handleOpenTask(t.id)}
                      title={`${t.task_key}: ${t.title}`}
                    >
                      <span className="fw-semibold me-1">{t.task_key || 'TASK'}:</span>
                      {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: TIMELINE / GANTT VIEW */}
      {viewMode === 'timeline' && (
        <div className="timeline-container">
          <div className="fw-semibold small text-muted text-uppercase mb-3">
            Schedule Overview & Deliverable Timeline
          </div>

          <div className="d-flex flex-column gap-2">
            {tasks.map((task) => (
              <div key={task.id} className="timeline-row">
                <div className="timeline-task-info">
                  <div className="fw-semibold small text-truncate" style={{ cursor: 'pointer' }} onClick={() => handleOpenTask(task.id)}>
                    <span className="badge bg-secondary font-monospace me-1" style={{ fontSize: '0.65rem' }}>
                      {task.task_key || `TASK-${task.id}`}
                    </span>
                    {task.title}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                    {task.due_date ? `Due: ${task.due_date}` : 'No due date'}
                  </div>
                </div>

                <div className="timeline-bar-area" onClick={() => handleOpenTask(task.id)} style={{ cursor: 'pointer' }}>
                  <div
                    className="timeline-bar"
                    style={{
                      left: '10%',
                      width: task.status === 'done' ? '80%' : task.status === 'in-progress' ? '50%' : '25%',
                      backgroundColor: task.project?.color || 'var(--tf-primary)',
                    }}
                  >
                    <span>{task.title}</span>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-5 text-muted small">No scheduled timeline items found.</div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
