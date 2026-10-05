import React from 'react';

export default function StatusBadge({ status }) {
  const configs = {
    'todo': {
      label: 'To Do',
      className: 'badge-status-todo',
      icon: 'bi-circle',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'badge-status-in-progress',
      icon: 'bi-arrow-repeat',
    },
    'done': {
      label: 'Completed',
      className: 'badge-status-done',
      icon: 'bi-check2-circle',
    },
  };

  const config = configs[status] || configs.todo;

  return (
    <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1.5 ${config.className}`} style={{ fontSize: '0.8rem' }}>
      <i className={`bi ${config.icon}`}></i>
      <span>{config.label}</span>
    </span>
  );
}
