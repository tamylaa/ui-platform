/**
 * Tamyla UI Platform - Core Platform Orchestrator
 * 
 * This is the main platform interface that provides unified access
 * to both vanilla JS and React components while maintaining framework
 * separation and ensuring consistent evolution of UI elements.
 */

import type { 
  PlatformConfig, 
  ComponentFactory, 
  FrameworkAdapter,
  PlatformInstance 
} from '../types/platform.js';

import { VanillaAdapter } from './adapters/vanilla.js';
import { ReactAdapter } from './adapters/react.js';
import { TokenManager } from '../tokens/token-manager.js';
import { ThemeManager } from '../core/theme-manager.js';

/**
 * Platform class - Central orchestrator for UI components
 * 
 * Provides a unified API while maintaining clear separation between
 * vanilla JS and React implementations.
 */
export class Platform implements PlatformInstance {
  private adapter: FrameworkAdapter;
  private tokenManager: TokenManager;
  private themeManager: ThemeManager;
  private config: PlatformConfig;

  constructor(config: PlatformConfig) {
    this.config = config;
    this.tokenManager = new TokenManager(config.tokens);
    this.themeManager = new ThemeManager(config.theme, this.tokenManager);
    this.adapter = this.createAdapter(config.framework);
  }

  /**
   * Create a new Platform instance
   */
  static create(config: Partial<PlatformConfig> = {}): Platform {
    const defaultConfig: PlatformConfig = {
      framework: 'auto',
      theme: 'default',
      tokens: {},
      features: {
        animations: true,
        accessibility: true,
        darkMode: true,
        rtl: false
      }
    };

    return new Platform({ ...defaultConfig, ...config });
  }

  /**
   * Component factory methods
   */
  button = (props: any) => this.adapter.createComponent('button', props);
  card = (props: any) => this.adapter.createComponent('card', props);
  input = (props: any) => this.adapter.createComponent('input', props);
  
  // Molecules
  searchBar = (props: any) => this.adapter.createComponent('searchBar', props);
  actionCard = (props: any) => this.adapter.createComponent('actionCard', props);
  contentCard = (props: any) => this.adapter.createComponent('contentCard', props);
  
  // Organisms
  dashboard = (props: any) => this.adapter.createComponent('dashboard', props);
  searchInterface = (props: any) => this.adapter.createComponent('searchInterface', props);
  
  // Applications
  contentManager = (props: any) => this.adapter.createComponent('contentManager', props);
  enhancedSearch = (props: any) => this.adapter.createComponent('enhancedSearch', props);
  campaignSelector = (props: any) => this.adapter.createComponent('campaignSelector', props);

  /**
   * Generic component factory
   */
  create(type: string, props: any = {}) {
    return this.adapter.createComponent(type, {
      ...props,
      theme: this.themeManager.getCurrentTheme(),
      tokens: this.tokenManager.getTokens()
    });
  }

  /**
   * Theme management
   */
  setTheme(themeName: string) {
    this.themeManager.setTheme(themeName);
    this.adapter.updateTheme(this.themeManager.getCurrentTheme());
  }

  getTheme() {
    return this.themeManager.getCurrentTheme();
  }

  /**
   * Token management
   */
  getTokens() {
    return this.tokenManager.getTokens();
  }

  updateTokens(tokens: Record<string, any>) {
    this.tokenManager.updateTokens(tokens);
    this.adapter.updateTokens(this.tokenManager.getTokens());
  }

  /**
   * Framework detection and adapter creation
   */
  private createAdapter(framework: string): FrameworkAdapter {
    if (framework === 'auto') {
      framework = this.detectFramework();
    }

    switch (framework) {
      case 'react':
        return new ReactAdapter(this.config);
      case 'vanilla':
        return new VanillaAdapter(this.config);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  /**
   * Auto-detect the current framework environment
   */
  private detectFramework(): string {
    // Check if React is available
    if (typeof window !== 'undefined' && (window as any).React) {
      return 'react';
    }

    // Check if we're in a React context
    try {
      const react = require('react');
      if (react && react.version) {
        return 'react';
      }
    } catch (e) {
      // React not available
    }

    // Default to vanilla
    return 'vanilla';
  }

  /**
   * Platform utilities
   */
  getConfig() {
    return { ...this.config };
  }

  getVersion() {
    return '1.0.0'; // This would be injected during build
  }

  getFramework() {
    return this.adapter.getFramework();
  }

  /**
   * Development utilities
   */
  debug() {
    return {
      config: this.config,
      framework: this.adapter.getFramework(),
      theme: this.themeManager.getCurrentTheme(),
      tokens: this.tokenManager.getTokens(),
      version: this.getVersion()
    };
  }
}

/**
 * Default platform instance for quick access
 */
export const platform = Platform.create();

/**
 * Convenience exports for direct component access
 */
export const {
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
  create
} = platform;
