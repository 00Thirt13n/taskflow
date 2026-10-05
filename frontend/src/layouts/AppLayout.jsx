import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function AppLayout() {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    api.get('/health')
      .then((res) => {
        if (isMounted) setHealthStatus(res.data.status === 'ok' ? 'healthy' : 'degraded');
      })
      .catch(() => {
        if (isMounted) setHealthStatus('unreachable');
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-4">
        <div className="container-xl">
          <Outlet />
        </div>
      </main>

      <footer className="py-3 mt-auto bg-white border-top">
        <div className="container-xl d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            <span className="fw-semibold text-dark">TaskFlow</span> v1.0.0 &copy; {new Date().getFullYear()} — Built with Laravel 11, React 18 &amp; MySQL 8.
          </div>
          <div className="d-flex align-items-center gap-2">
            <span>API Status:</span>
            <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${
              healthStatus === 'healthy' ? 'bg-success-subtle text-success border border-success' :
              healthStatus === 'degraded' ? 'bg-warning-subtle text-warning border border-warning' :
              'bg-danger-subtle text-danger border border-danger'
            }`}>
              <span className="spinner-grow spinner-grow-sm" style={{ width: '6px', height: '6px' }} role="status"></span>
              {healthStatus}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
