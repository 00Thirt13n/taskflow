import React from 'react';

export default function PriorityBadge({ priority }) {
  const configs = {
    'low': {
      label: 'Low',
      className: 'badge-priority-low',
      icon: 'bi-dash',
    },
    'medium': {
      label: 'Medium',
      className: 'badge-priority-medium',
      icon: 'bi-reception-2',
    },
    'high': {
      label: 'High',
      className: 'badge-priority-high',
      icon: 'bi-exclamation-triangle-fill',
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1 ${config.className}`} style={{ fontSize: '0.75rem' }}>
      <i className={`bi ${config.icon}`}></i>
      <span>{config.label}</span>
    </span>
  );
}
