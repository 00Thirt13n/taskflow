import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { useToast } from '../context/ToastContext';

export default function ReportsPage() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getOverview();
      setData(res);
    } catch (err) {
      addToast('Failed to load analytics overview', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('taskflow_token');
    window.open(`/api/reports/export?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2"></div>Generating executive report...
      </div>
    );
  }

  const status = data?.status_breakdown || { todo: 0, in_progress: 0, done: 0 };
  const totalTasks = status.todo + status.in_progress + status.done;
  const completionRate = totalTasks > 0 ? Math.round((status.done / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Analytics & Reports</h2>
          <p className="text-muted small mb-0">
            Real-time delivery velocity, member workload distribution, and project health.
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-sm"
          onClick={handleExportCsv}
        >
          <i className="bi bi-download"></i>
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tf-card p-3">
            <div className="text-muted small text-uppercase">Total Deliverables</div>
            <div className="fs-3 fw-bold mt-1">{totalTasks}</div>
            <div className="small text-muted mt-1">{status.todo} todo • {status.in_progress} in progress</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tf-card p-3">
            <div className="text-muted small text-uppercase">Completion Rate</div>
            <div className="fs-3 fw-bold text-success mt-1">{completionRate}%</div>
            <div className="small text-muted mt-1">{status.done} tasks completed</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tf-card p-3">
            <div className="text-muted small text-uppercase">Active Projects</div>
            <div className="fs-3 fw-bold text-primary mt-1">{data?.projects?.length || 0}</div>
            <div className="small text-muted mt-1">Cross-functional initiatives</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tf-card p-3">
            <div className="text-muted small text-uppercase">Team Capacity</div>
            <div className="fs-3 fw-bold text-info mt-1">{data?.team_workload?.length || 0}</div>
            <div className="small text-muted mt-1">Active team contributors</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* TEAM WORKLOAD */}
        <div className="col-12 col-lg-6">
          <div className="tf-card h-100 p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-lines-fill text-primary"></i>
              <span>Team Workload Distribution</span>
            </h5>
            <div className="d-flex flex-column gap-3">
              {data?.team_workload?.map((mem) => (
                <div key={mem.id} className="p-2 rounded bg-light" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1 small">
                    <span className="fw-semibold">{mem.name}</span>
                    <span className="text-muted">{mem.active_tasks} active • {mem.completed_tasks} completed</span>
                  </div>
                  <div className="progress" style={{ height: '7px' }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${mem.workload_pct}%` }}
                    ></div>
                  </div>
                  {mem.overdue_tasks > 0 && (
                    <div className="text-danger small mt-1" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-exclamation-circle me-1"></i>{mem.overdue_tasks} overdue task(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-DAY DELIVERY VELOCITY */}
        <div className="col-12 col-lg-6">
          <div className="tf-card h-100 p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-success"></i>
              <span>7-Day Delivery Velocity</span>
            </h5>
            <div className="table-responsive">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Created</th>
                    <th>Completed</th>
                    <th>Net Velocity</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.velocity?.map((v) => {
                    const net = v.completed - v.created;
                    return (
                      <tr key={v.date}>
                        <td className="fw-semibold">{v.day} <span className="text-muted small">({v.date})</span></td>
                        <td><span className="badge bg-secondary">{v.created}</span></td>
                        <td><span className="badge bg-success">{v.completed}</span></td>
                        <td className={net >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {net > 0 ? `+${net}` : net}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PROJECT HEALTH SUMMARY */}
        <div className="col-12">
          <div className="tf-card overflow-hidden">
            <div className="tf-card-header">
              <span className="fw-bold small text-uppercase">Project Health &amp; Execution Progress</span>
            </div>
            <div className="table-responsive">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Key</th>
                    <th>Health</th>
                    <th>Progress</th>
                    <th>Total Tasks</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.projects?.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">
                        <span
                          className="rounded-circle d-inline-block me-2"
                          style={{ width: '8px', height: '8px', backgroundColor: p.color }}
                        ></span>
                        {p.name}
                      </td>
                      <td><span className="badge bg-secondary font-monospace">{p.key}</span></td>
                      <td>
                        <span className={`badge ${
                          p.health === 'Healthy' ? 'bg-success' : p.health === 'At Risk' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {p.health}
                        </span>
                      </td>
                      <td style={{ width: '200px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div className="progress-bar" style={{ width: `${p.progress_pct}%`, backgroundColor: p.color }}></div>
                          </div>
                          <span className="small text-muted">{p.progress_pct}%</span>
                        </div>
                      </td>
                      <td>{p.total_tasks}</td>
                      <td>{p.completed_tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
