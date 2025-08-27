/**
 * Core Platform Type Definitions
 * 
 * Defines the interfaces and types for the UI Platform system
 */

export interface PlatformConfig {
  framework: 'vanilla' | 'react' | 'auto';
  theme: string;
  tokens: Record<string, any>;
  features: {
    animations: boolean;
    accessibility: boolean;
    darkMode: boolean;
    rtl: boolean;
  };
}

export interface ComponentFactory {
  (type: string, props: any): any;
}

export interface FrameworkAdapter {
  createComponent(type: string, props: any): any;
  updateTheme(theme: any): void;
  updateTokens(tokens: any): void;
  getFramework(): string;
}

export interface PlatformInstance {
  // Component factories
  button: (props: any) => any;
  card: (props: any) => any;
  input: (props: any) => any;
  searchBar: (props: any) => any;
  actionCard: (props: any) => any;
  contentCard: (props: any) => any;
  dashboard: (props: any) => any;
  searchInterface: (props: any) => any;
  contentManager: (props: any) => any;
  enhancedSearch: (props: any) => any;
  campaignSelector: (props: any) => any;
  
  // Generic factory
  create: (type: string, props?: any) => any;
  
  // Theme management
  setTheme: (themeName: string) => void;
  getTheme: () => any;
  
  // Token management
  getTokens: () => any;
  updateTokens: (tokens: Record<string, any>) => void;
  
  // Utilities
  getConfig: () => PlatformConfig;
  getVersion: () => string;
  getFramework: () => string;
  debug: () => any;
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
    fontFamily: string;
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
  typography: Record<string, any>;
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
  style?: Record<string, any>;
  children?: any;
  onClick?: (event: any) => void;
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
  footer?: any;
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
