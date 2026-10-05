import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(() => showToast('Failed to load system users.', 'danger'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-people-fill text-primary"></i> System Users
          </h2>
          <p className="text-muted small mb-0">
            Inspect all registered users, roles, and operational task distributions.
          </p>
        </div>
      </div>

      <div className="card shadow-sm border">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4"><LoadingSkeleton count={4} /></div>
          ) : users.length === 0 ? (
            <div className="p-5 text-center text-muted">No users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">User</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col" className="text-center">Total Tasks</th>
                    <th scope="col">Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="text-muted small">#{u.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{u.name}</div>
                      </td>
                      <td className="small text-secondary">{u.email}</td>
                      <td>
                        <span className={`badge ${u.is_admin ? 'bg-primary' : 'bg-secondary'}`}>
                          {u.role ? u.role.toUpperCase() : 'USER'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-2.5 py-1">
                          {u.tasks_count ?? 0} tasks
                        </span>
                      </td>
                      <td className="small text-muted">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
