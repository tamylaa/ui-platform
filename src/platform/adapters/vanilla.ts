/**
 * Vanilla JavaScript Framework Adapter
 * 
 * Bridges the platform to @tamyla/ui-components (vanilla JS)
 */

import type { FrameworkAdapter, PlatformConfig } from '../../types/platform.js';

export class VanillaAdapter implements FrameworkAdapter {
  private config: PlatformConfig;
  private componentLibrary: any;

  constructor(config: PlatformConfig) {
    this.config = config;
    this.loadComponentLibrary();
  }

  /**
   * Create a component using the vanilla JS library
   */
  createComponent(type: string, props: any = {}): HTMLElement {
    if (!this.componentLibrary) {
      throw new Error('Vanilla JS component library not loaded');
    }

    const enhancedProps = {
      ...props,
      theme: this.config.theme,
      className: `tmyl-${type} ${props.className || ''}`.trim(),
    };

    // Map component types to factory functions
    const componentMap: Record<string, string> = {
      // Atoms
      'button': 'createButton',
      'card': 'createCard',
      'input': 'createInput',
      
      // Molecules
      'searchBar': 'createSearchBar',
      'actionCard': 'createActionCard',
      'contentCard': 'createContentCard',
      'notification': 'createNotification',
      'fileList': 'createFileList',
      
      // Organisms
      'dashboard': 'createDashboard',
      'searchInterface': 'createSearchInterface',
      
      // Applications
      'contentManager': 'createContentManager',
      'enhancedSearch': 'createEnhancedSearch',
      'campaignSelector': 'createCampaignSelector',
    };

    const factoryFunction = componentMap[type];
    if (!factoryFunction) {
      throw new Error(`Unknown component type: ${type}`);
    }

    if (typeof this.componentLibrary[factoryFunction] !== 'function') {
      throw new Error(`Component factory ${factoryFunction} not found in vanilla library`);
    }

    return this.componentLibrary[factoryFunction](enhancedProps);
  }

  /**
   * Update theme for all components
   */
  updateTheme(theme: any): void {
    // Apply theme to CSS custom properties
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme.name);
    }

    // Update component library theme if it supports it
    if (this.componentLibrary && typeof this.componentLibrary.setTheme === 'function') {
      this.componentLibrary.setTheme(theme);
    }
  }

  /**
   * Update design tokens
   */
  updateTokens(tokens: any): void {
    if (this.componentLibrary && typeof this.componentLibrary.updateTokens === 'function') {
      this.componentLibrary.updateTokens(tokens);
    }
  }

  /**
   * Get framework identifier
   */
  getFramework(): string {
    return 'vanilla';
  }

  /**
   * Load the vanilla JS component library
   */
  private async loadComponentLibrary(): Promise<void> {
    try {
      // For now, we'll use the mock library since packages aren't migrated yet
      console.log('Loading vanilla JS component library...');
      this.componentLibrary = this.createMockLibrary();
    } catch (error) {
      console.warn('Could not load @tamyla/ui-components:', error);
      this.componentLibrary = this.createMockLibrary();
    }
  }

  /**
   * Create mock component library for development/testing
   */
  private createMockLibrary(): any {
    const createMockComponent = (type: string) => (props: any) => {
      const element = document.createElement('div');
      element.className = `tmyl-${type} tmyl-mock-component`;
      element.setAttribute('data-type', type);
      
      // Add basic styling
      element.style.cssText = `
        padding: 1rem;
        border: 2px dashed #ccc;
        border-radius: 0.375rem;
        background: #f8f9fa;
        color: #6c757d;
        font-family: monospace;
        text-align: center;
        margin: 0.5rem;
      `;
      
      element.textContent = `Mock ${type} component`;
      
      // Add props as data attributes
      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          element.setAttribute(`data-${key}`, value.toString());
        }
      });

      return element;
    };

    return {
      createButton: createMockComponent('button'),
      createCard: createMockComponent('card'),
      createInput: createMockComponent('input'),
      createSearchBar: createMockComponent('searchBar'),
      createActionCard: createMockComponent('actionCard'),
      createContentCard: createMockComponent('contentCard'),
      createNotification: createMockComponent('notification'),
      createFileList: createMockComponent('fileList'),
      createDashboard: createMockComponent('dashboard'),
      createSearchInterface: createMockComponent('searchInterface'),
      createContentManager: createMockComponent('contentManager'),
      createEnhancedSearch: createMockComponent('enhancedSearch'),
      createCampaignSelector: createMockComponent('campaignSelector'),
      setTheme: (theme: any) => console.log('Mock: Theme updated to', theme.name),
      updateTokens: (tokens: any) => console.log('Mock: Tokens updated', tokens),
    };
  }
}
