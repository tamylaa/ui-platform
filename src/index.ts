/**
 * Tamyla UI Platform - Main Entry Point
 *
 * Unified access to all UI components across frameworks
 */

export { Platform, platform } from './platform/index.js';
export { TokenManager } from './tokens/token-manager.js';
export { ThemeManager } from './core/theme-manager.js';

// Type exports
export type {
  PlatformConfig,
  PlatformInstance,
  FrameworkAdapter,
  Theme,
  DesignTokens,
  ComponentProps,
  ButtonProps,
  CardProps,
  InputProps,
} from './types/platform.js';

// Direct component exports (auto-detects framework)
export {
  button,
  card,
  input,
  searchBar,
  actionCard,
  contentCard,
  dashboard,
  searchInterface,
  contentManager,
  enhancedSearch,
  campaignSelector,
  create,
} from './platform/index.js';

// Framework-specific exports
export * as vanilla from './vanilla/index.js';
export * as react from './react/index.js';
export * as core from './core/index.js';
export * as tokens from './tokens/index.js';
