import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

export default function AdminCenterPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('users'); // users, audit, health

  // Users tab state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Audit logs tab state
  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState(null);
  const [logPage, setLogPage] = useState(1);
  const [logSearch, setLogSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [inspectingLog, setInspectingLog] = useState(null);

  // System Health tab state
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'health') loadSystemHealth();
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      addToast('Failed to load system users', 'danger');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: { ...u.role, name: newRole } } : u))
      );
      addToast(`Updated user role to ${newRole}`, 'success');
    } catch (err) {
      addToast('Failed to update role', 'danger');
    }
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await adminService.getAuditLogs({ page: logPage, search: logSearch });
      setLogs(res.data || []);
      setLogMeta(res.meta || null);
    } catch (err) {
      addToast('Failed to load audit logs', 'danger');
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadSystemHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await adminService.getSystemHealth();
      setHealthData(data);
    } catch (err) {
      addToast('Failed to fetch system diagnostics', 'danger');
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Admin Center</h2>
          <p className="text-muted small mb-0">
            Enterprise administration, access control, audit trail, and system diagnostics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="btn-group bg-surface p-1 border rounded shadow-sm" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> Members
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => setActiveTab('audit')}
          >
            <i className="bi bi-journal-text me-1"></i> Audit Logs
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'health' ? 'btn-primary' : 'btn-light border-0'}`}
            onClick={() => setActiveTab('health')}
          >
            <i className="bi bi-activity me-1"></i> System Health
          </button>
        </div>
      </div>

      {/* TAB 1: TEAM MEMBERS */}
      {activeTab === 'users' && (
        <div className="tf-card overflow-hidden">
          <div className="tf-card-header">
            <span className="fw-bold small text-uppercase">Workspace Members ({users.length})</span>
          </div>

          <div className="table-responsive">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Projects</th>
                  <th>Tasks</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-circle">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <span className="fw-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td><span className="text-muted small">{u.email}</span></td>
                    <td>
                      <span className={`badge ${u.role?.name === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                        {u.role?.name || 'user'}
                      </span>
                    </td>
                    <td>{u.projects_count ?? '—'}</td>
                    <td>{u.tasks_count ?? '—'}</td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm d-inline-block w-auto"
                        value={u.role?.name || 'user'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS & DIFF DRAWER */}
      {activeTab === 'audit' && (
        <div className="tf-card overflow-hidden">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between gap-3">
            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search action, IP, or type..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAuditLogs()}
              />
              <button className="btn btn-outline-secondary" onClick={loadAuditLogs}>
                <i className="bi bi-search"></i>
              </button>
            </div>
            <span className="text-muted small">Append-only audit trail</span>
          </div>

          <div className="table-responsive">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th className="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="small text-muted">{log.created_at}</td>
                    <td className="fw-semibold small">{log.user ? log.user.name : 'System'}</td>
                    <td><span className="badge bg-secondary font-monospace" style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                    <td className="small text-muted">{log.entity_type} #{log.entity_id}</td>
                    <td className="small text-muted font-monospace">{log.ip_address}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setInspectingLog(log)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted small">No audit logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logMeta && logMeta.last_page > 1 && (
            <div className="p-3 border-top">
              <Pagination meta={logMeta} onPageChange={(p) => setLogPage(p)} />
            </div>
          )}

          {/* Inspect Diff Modal */}
          {inspectingLog && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content shadow-lg border-0" style={{ backgroundColor: 'var(--tf-bg-surface)' }}>
                  <div className="modal-header border-bottom py-3">
                    <h5 className="modal-title fw-bold">Audit Event #{inspectingLog.id}</h5>
                    <button type="button" className="btn-close" onClick={() => setInspectingLog(null)}></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="row g-3 mb-3 small">
                      <div className="col-4"><strong>Action:</strong> {inspectingLog.action}</div>
                      <div className="col-4"><strong>Actor:</strong> {inspectingLog.user?.name || 'System'}</div>
                      <div className="col-4"><strong>Timestamp:</strong> {inspectingLog.created_at}</div>
                    </div>

                    <div className="fw-semibold small text-muted text-uppercase mb-2">Raw Metadata &amp; Changes Payload</div>
                    <pre
                      className="p-3 bg-light rounded border text-muted"
                      style={{ backgroundColor: 'var(--tf-bg-subtle)', maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {JSON.stringify(inspectingLog.metadata, null, 2)}
                    </pre>
                  </div>
                  <div className="modal-footer border-top py-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInspectingLog(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH & DIAGNOSTICS */}
      {activeTab === 'health' && healthData && (
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="tf-card p-4 h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-cpu text-primary"></i>
                <span>Application Runtime</span>
              </h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Version</span>
                  <strong>TaskFlow v{healthData.application?.version}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Environment</span>
                  <span className="badge bg-success">{healthData.application?.environment}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>PHP Version</span>
                  <strong>{healthData.application?.php_version}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Laravel Framework</span>
                  <strong>{healthData.application?.laravel_version}</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="tf-card p-4 h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-database-check text-success"></i>
                <span>Database Connectivity &amp; Metrics</span>
              </h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Driver</span>
                  <strong>{healthData.database?.driver?.toUpperCase()} 8.0</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Connection Latency</span>
                  <strong className="text-success">{healthData.database?.latency_ms} ms</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Total Tasks Count</span>
                  <strong>{healthData.database?.counts?.tasks} records</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 bg-transparent">
                  <span>Audit Logs Count</span>
                  <strong>{healthData.database?.counts?.audit_logs} records</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
