import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import TaskFormModal from '../components/TaskFormModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query & Filter states
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 350);

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [dueDateFilter, setDueDateFilter] = useState(searchParams.get('due_date') || '');
  const [ownerFilter, setOwnerFilter] = useState(searchParams.get('user_id') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data states
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemUsers, setSystemUsers] = useState([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load admin user list once if admin
  useEffect(() => {
    if (isAdmin) {
      adminService.getUsers()
        .then(setSystemUsers)
        .catch(() => {});
    }
  }, [isAdmin]);

  // Sync state with URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (dueDateFilter) params.set('due_date', dueDateFilter);
    if (ownerFilter) params.set('user_id', ownerFilter);
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    if (currentPage > 1) params.set('page', String(currentPage));

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, statusFilter, priorityFilter, dueDateFilter, ownerFilter, sortBy, sortOrder, currentPage, setSearchParams]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (dueDateFilter) params.due_date = dueDateFilter;
      if (ownerFilter) params.user_id = ownerFilter;

      const response = await taskService.getTasks(params);
      setTasks(response.data || []);
      setMeta(response.meta || null);
    } catch {
      showToast('Failed to fetch tasks.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter, dueDateFilter, ownerFilter, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPriorityFilter('');
    setDueDateFilter('');
    setOwnerFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Task CRUD operations
  const handleSaveTask = async (data, id) => {
    if (id) {
      await taskService.updateTask(id, data);
      showToast('Task updated successfully.', 'success');
    } else {
      await taskService.createTask(data);
      showToast('Task created successfully.', 'success');
    }
    fetchTasks();
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      await taskService.updateStatus(task.id, newStatus);
      showToast(`Task status changed to ${newStatus}.`, 'success');
      fetchTasks();
    } catch {
      showToast('Failed to change status. Reverting.', 'danger');
      fetchTasks();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(deletingTask.id);
      showToast('Task deleted successfully.', 'success');
      setDeletingTask(null);
      fetchTasks();
    } catch {
      showToast('Failed to delete task.', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(searchInput || statusFilter || priorityFilter || dueDateFilter || ownerFilter);

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Task Management</h2>
          <p className="text-muted small mb-0">
            {isAdmin ? 'Manage all company tasks with administrative privileges.' : 'Organize, track, and complete your assigned tasks.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={() => {
            setEditingTask(null);
            setIsFormModalOpen(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card shadow-sm mb-4 border p-3">
        <div className="row g-3 align-items-center">
          {/* Search box */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search title or description..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search tasks"
              />
              {searchInput && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0 border"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Select */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>

          {/* Priority Select */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => handleFilterChange(setPriorityFilter, e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              aria-label="Sort tasks by"
            >
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="due_date:asc">Earliest Due Date</option>
              <option value="due_date:desc">Latest Due Date</option>
            </select>
          </div>

          {/* Admin Owner Filter */}
          {isAdmin && (
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={ownerFilter}
                onChange={(e) => handleFilterChange(setOwnerFilter, e.target.value)}
                aria-label="Filter by task owner"
              >
                <option value="">All Owners</option>
                {systemUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top small flex-wrap">
            <span className="text-muted fw-semibold">Active Filters:</span>
            {debouncedSearch && <span className="badge bg-light text-dark border">Search: "{debouncedSearch}"</span>}
            {statusFilter && <span className="badge bg-light text-dark border">Status: {statusFilter}</span>}
            {priorityFilter && <span className="badge bg-light text-dark border">Priority: {priorityFilter}</span>}
            {dueDateFilter && <span className="badge bg-light text-dark border">Due: {dueDateFilter}</span>}
            {ownerFilter && <span className="badge bg-light text-dark border">Owner ID: #{ownerFilter}</span>}
            <button
              type="button"
              className="btn btn-link btn-sm text-danger p-0 ms-2 text-decoration-none"
              onClick={handleClearFilters}
            >
              <i className="bi bi-x-circle me-1"></i> Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Task List Table / Cards */}
      <div className="card shadow-sm border">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4"><LoadingSkeleton count={5} /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon="bi-check2-circle"
              title="No tasks match your criteria"
              message={hasActiveFilters ? 'Try adjusting your search terms or filter selections.' : 'You have no tasks created yet. Click below to add your first task!'}
              actionText={hasActiveFilters ? 'Clear Filters' : 'Create Task'}
              onAction={hasActiveFilters ? handleClearFilters : () => setIsFormModalOpen(true)}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th scope="col" style={{ width: '48px' }} className="text-center">Done</th>
                    <th scope="col">Task Details</th>
                    <th scope="col" style={{ width: '130px' }}>Status</th>
                    <th scope="col" style={{ width: '110px' }}>Priority</th>
                    <th scope="col" style={{ width: '140px' }}>Due Date</th>
                    {isAdmin && <th scope="col" style={{ width: '150px' }}>Owner</th>}
                    <th scope="col" style={{ width: '110px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const isDone = task.status === 'done';

                    return (
                      <tr key={task.id}>
                        {/* Checkbox for quick completion toggle */}
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isDone}
                            onChange={() => handleQuickStatusChange(task, isDone ? 'todo' : 'done')}
                            title={`Mark as ${isDone ? 'incomplete' : 'completed'}`}
                            aria-label={`Toggle completion for ${task.title}`}
                          />
                        </td>

                        {/* Title & Description */}
                        <td>
                          <div className={`fw-semibold ${isDone ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="small text-muted text-truncate" style={{ maxWidth: '420px' }}>
                              {task.description}
                            </div>
                          )}
                        </td>

                        {/* Status Select dropdown */}
                        <td>
                          <select
                            className="form-select form-select-sm border-0 bg-transparent fw-medium"
                            value={task.status}
                            onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                            aria-label="Change status"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Completed</option>
                          </select>
                        </td>

                        {/* Priority Badge */}
                        <td>
                          <PriorityBadge priority={task.priority} />
                        </td>

                        {/* Due Date with Overdue Indicator */}
                        <td>
                          {task.due_date ? (
                            <span className={`small ${task.is_overdue ? 'badge badge-overdue' : 'text-secondary'}`}>
                              <i className="bi bi-calendar3 me-1"></i> {task.due_date}
                            </span>
                          ) : (
                            <span className="small text-muted">—</span>
                          )}
                        </td>

                        {/* Admin Owner Column */}
                        {isAdmin && (
                          <td>
                            <div className="small fw-medium text-dark">{task.user?.name || `User #${task.user_id}`}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{task.user?.email}</div>
                          </td>
                        )}

                        {/* Actions (Edit / Delete) */}
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => {
                                setEditingTask(task);
                                setIsFormModalOpen(true);
                              }}
                              title="Edit task details"
                              aria-label={`Edit ${task.title}`}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setDeletingTask(task)}
                              title="Delete task"
                              aria-label={`Delete ${task.title}`}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {meta && (
          <div className="p-3 bg-white">
            <Pagination meta={meta} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        users={systemUsers}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
