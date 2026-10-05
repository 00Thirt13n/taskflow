import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders To Do badge properly', () => {
    render(<StatusBadge status="todo" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders In Progress badge properly', () => {
    render(<StatusBadge status="in-progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders Completed badge properly', () => {
    render(<StatusBadge status="done" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
