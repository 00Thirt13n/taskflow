import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default theme and updates on toggle', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('current-theme');
    const initialTheme = themeSpan.textContent;
    expect(['light', 'dark']).toContain(initialTheme);

    const button = screen.getByText('Toggle');
    fireEvent.click(button);

    const updatedTheme = screen.getByTestId('current-theme').textContent;
    expect(updatedTheme).not.toBe(initialTheme);
    expect(localStorage.getItem('taskflow_theme')).toBe(updatedTheme);
  });
});
