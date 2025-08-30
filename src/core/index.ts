/**
 * Core Exports
 *
 * Core platform utilities, theme management, and design system
 */

export { ThemeManager } from './theme-manager.js';

// Re-export types
export type { Theme } from '../types/platform.js';

// Import types for implementation
import type { Theme } from '../types/platform.js';

// Utility functions
export const createTheme = (name: string, theme: Partial<Theme>): Theme => {
  const defaultTheme: Theme = {
    name,
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      neutral: '#6c757d',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    typography: {
      fontFamily: {
        sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
      },
      lineHeight: {
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
      },
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    breakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px',
    },
  };

  return { ...defaultTheme, ...theme, name };
};
