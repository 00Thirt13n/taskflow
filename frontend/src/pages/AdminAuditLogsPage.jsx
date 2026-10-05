import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const { showToast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
      };
      if (actionFilter) params.action = actionFilter;

      const response = await adminService.getAuditLogs(params);
      setLogs(response.data || []);
      setMeta(response.meta || null);
    } catch {
      showToast('Failed to load administrative audit logs.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleExpand = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('deleted')) return 'bg-danger-subtle text-danger border border-danger';
    if (action.includes('created')) return 'bg-success-subtle text-success border border-success';
    if (action.includes('status')) return 'bg-info-subtle text-info border border-info';
    if (action.includes('login') || action.includes('auth')) return 'bg-primary-subtle text-primary border border-primary';
    return 'bg-secondary-subtle text-secondary border border-secondary';
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-shield-shaded text-primary"></i> Administrative Audit Logs
          </h2>
          <p className="text-muted small mb-0">
            Immutable, append-only security logs tracking user and administrative actions.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ minWidth: '180px' }}
            aria-label="Filter audit action"
          >
            <option value="">All Audited Actions</option>
            <option value="task.created">task.created</option>
            <option value="task.updated">task.updated</option>
            <option value="task.status_changed">task.status_changed</option>
            <option value="task.deleted">task.deleted</option>
            <option value="auth.login">auth.login</option>
            <option value="auth.registered">auth.registered</option>
            <option value="auth.logout">auth.logout</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm border">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4"><LoadingSkeleton count={5} /></div>
          ) : logs.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-clipboard-x fs-2 text-secondary d-block mb-2"></i>
              No audit logs found matching the filter.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th scope="col">Timestamp (UTC)</th>
                    <th scope="col">Action</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Entity</th>
                    <th scope="col">IP Address</th>
                    <th scope="col" className="text-end">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <tr>
                          <td className="small text-muted text-nowrap">
                            <i className="bi bi-clock me-1"></i>
                            {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                          </td>
                          <td>
                            <span className={`badge px-2 py-1 ${getActionBadgeClass(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            {log.user ? (
                              <div>
                                <div className="fw-medium small text-dark">{log.user.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{log.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-muted small">System / Anonymous</span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {log.entity_type} #{log.entity_id || '—'}
                            </span>
                          </td>
                          <td className="small text-muted font-monospace">
                            {log.ip_address || '—'}
                          </td>
                          <td className="text-end">
                            {log.metadata && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                onClick={() => toggleExpand(log.id)}
                                aria-label="Toggle metadata JSON"
                              >
                                <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                <span className="ms-1 small">{isExpanded ? 'Hide' : 'Inspect'}</span>
                              </button>
                            )}
                          </td>
                        </tr>

                        {isExpanded && log.metadata && (
                          <tr className="bg-light">
                            <td colSpan="6" className="p-3">
                              <div className="card bg-dark text-light p-3 border-0">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="small text-muted font-monospace">Contextual Metadata Payload</span>
                                  <span className="badge bg-secondary font-monospace">JSON</span>
                                </div>
                                <pre className="mb-0 small text-success font-monospace" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta && (
          <div className="p-3 bg-white">
            <Pagination meta={meta} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>
    </div>
  );
}
