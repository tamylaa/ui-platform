/**
 * Core Platform Type Definitions
 *
 * Defines the interfaces and types for the UI Platform system
 */

// Component and theme related types
export type ThemeConfig = Record<string, unknown>;
export type TokenConfig = Record<string, unknown>;
export type ComponentElement = Element | unknown | null;

export interface PlatformConfig {
  framework: 'vanilla' | 'react' | 'auto';
  theme: string;
  tokens: TokenConfig;
  features: {
    animations: boolean;
    accessibility: boolean;
    darkMode: boolean;
    rtl: boolean;
  };
}

export interface ComponentFactory {
  (type: string, props: ComponentProps): ComponentElement;
}

export interface FrameworkAdapter {
  createComponent(type: string, props: ComponentProps): ComponentElement;
  updateTheme(theme: ThemeConfig): void;
  updateTokens(tokens: TokenConfig): void;
  getFramework(): string;
}

export interface PlatformInstance {
  // Component factories
  button: (props: Record<string, unknown>) => unknown;
  card: (props: Record<string, unknown>) => unknown;
  input: (props: Record<string, unknown>) => unknown;
  searchBar: (props: Record<string, unknown>) => unknown;
  actionCard: (props: Record<string, unknown>) => unknown;
  contentCard: (props: Record<string, unknown>) => unknown;
  dashboard: (props: Record<string, unknown>) => unknown;
  searchInterface: (props: Record<string, unknown>) => unknown;
  contentManager: (props: Record<string, unknown>) => unknown;
  enhancedSearch: (props: Record<string, unknown>) => unknown;
  campaignSelector: (props: Record<string, unknown>) => unknown;

  // Generic factory
  create: (type: string, props?: Record<string, unknown>) => unknown;

  // Theme management
  setTheme: (themeName: string) => void;
  getTheme: () => Theme | null;

  // Token management
  getTokens: () => DesignTokens;
  updateTokens: (tokens: Record<string, unknown>) => void;

  // Utilities
  getConfig: () => PlatformConfig;
  getVersion: () => string;
  getFramework: () => string;
  debug: () => Record<string, unknown>;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      normal: number;
      relaxed: number;
      loose: number;
    };
    letterSpacing: {
      normal: string;
      wide: string;
      wider: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
    letterSpacing: Record<string, string>;
  };
  borders: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  zIndex: Record<string, number>;
}

export interface ComponentProps {
  variant?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: Theme;
  tokens?: DesignTokens;
  className?: string;
  style?: Record<string, string | number>;
  children?: unknown; // Can be ReactNode, HTMLElement, string, etc.
  onClick?: (event: Event) => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ButtonProps extends ComponentProps {
  text?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export interface CardProps extends ComponentProps {
  title?: string;
  content?: string;
  footer?: unknown; // Can be React component, HTML element, string, etc.
  padding?: boolean;
  border?: boolean;
  shadow?: boolean;
}

export interface InputProps extends ComponentProps {
  placeholder?: string;
  value?: string;
  type?: string;
  label?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}
