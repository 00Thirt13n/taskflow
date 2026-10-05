import React from 'react';

/**
 * TaskFlow Original Brand Logo & Wordmark
 *
 * Geometric progression chevron symbolizing clarity, momentum, and forward execution.
 */
export default function TaskFlowLogo({ size = 'md', showWordmark = true, className = '' }) {
  const sizeMap = {
    xs: { icon: 20, text: 'text-sm' },
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 30, text: 'text-lg' },
    lg: { icon: 38, text: 'text-2xl' },
    xl: { icon: 48, text: 'text-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`d-inline-flex align-items-center gap-2 text-decoration-none ${className}`} style={{ userSelect: 'none' }}>
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tf-brand-gradient-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="tf-brand-gradient-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Primary Left Chevron */}
        <path
          d="M6 8L16 18L6 28H13L23 18L13 8H6Z"
          fill="url(#tf-brand-gradient-a)"
        />

        {/* Secondary Right Forward Pulse Chevron */}
        <path
          d="M17 8L27 18L17 28H23L33 18L23 8H17Z"
          fill="url(#tf-brand-gradient-b)"
          opacity="0.9"
        />

        {/* Dynamic Focus Node */}
        <circle cx="14" cy="18" r="2.2" fill="#ffffff" opacity="0.9" />
      </svg>

      {showWordmark && (
        <span
          className={`fw-bold tracking-tight text-brand-title ${currentSize.text}`}
          style={{ letterSpacing: '-0.025em', lineHeight: 1 }}
        >
          <span className="text-body fw-bold">Task</span>
          <span style={{ color: 'var(--brand-primary, #6366f1)', fontWeight: 800 }}>Flow</span>
        </span>
      )}
    </div>
  );
}
