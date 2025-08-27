/**
 * React Framework Adapter
 * 
 * Bridges the platform to @tamyla/ui-components-react
 */

import type { FrameworkAdapter, PlatformConfig } from '../../types/platform.js';

export class ReactAdapter implements FrameworkAdapter {
  private config: PlatformConfig;
  private componentLibrary: any;

  constructor(config: PlatformConfig) {
    this.config = config;
    this.loadComponentLibrary();
  }

  /**
   * Create a component using the React library
   */
  createComponent(type: string, props: any = {}): any {
    if (!this.componentLibrary) {
      throw new Error('React component library not loaded');
    }

    const enhancedProps = {
      ...props,
      theme: this.config.theme,
      className: `tmyl-${type} ${props.className || ''}`.trim(),
    };

    // Map component types to React components
    const componentMap: Record<string, string> = {
      // Atoms
      'button': 'Button',
      'card': 'Card',
      'input': 'Input',
      
      // Molecules
      'searchBar': 'SearchBar',
      'actionCard': 'ActionCard',
      'contentCard': 'ContentCard',
      'notification': 'Notification',
      'fileList': 'FileList',
      
      // Organisms
      'dashboard': 'Dashboard',
      'searchInterface': 'SearchInterface',
      
      // Applications
      'contentManager': 'ContentManager',
      'enhancedSearch': 'EnhancedSearch',
      'campaignSelector': 'CampaignSelector',
    };

    const ComponentName = componentMap[type];
    if (!ComponentName) {
      throw new Error(`Unknown component type: ${type}`);
    }

    const Component = this.componentLibrary[ComponentName];
    if (!Component) {
      throw new Error(`Component ${ComponentName} not found in React library`);
    }

    // Return React element factory
    return (additionalProps = {}) => {
      const React = this.getReact();
      return React.createElement(Component, { 
        ...enhancedProps, 
        ...additionalProps 
      });
    };
  }

  /**
   * Update theme for all components
   */
  updateTheme(theme: any): void {
    // Update theme context if available
    if (this.componentLibrary && typeof this.componentLibrary.updateTheme === 'function') {
      this.componentLibrary.updateTheme(theme);
    }

    // Apply theme to CSS custom properties for React components
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme.name);
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
    return 'react';
  }

  /**
   * Get React instance
   */
  private getReact(): any {
    // Try to get React from various sources
    if (typeof window !== 'undefined' && (window as any).React) {
      return (window as any).React;
    }

    try {
      return require('react');
    } catch (e) {
      throw new Error('React is required but not found. Please install React.');
    }
  }

  /**
   * Load the React component library
   */
  private async loadComponentLibrary(): Promise<void> {
    try {
      // For now, we'll use the mock library since packages aren't migrated yet
      console.log('Loading React component library...');
      this.componentLibrary = this.createMockLibrary();
    } catch (error) {
      console.warn('Could not load @tamyla/ui-components-react:', error);
      this.componentLibrary = this.createMockLibrary();
    }
  }

  /**
   * Create mock component library for development/testing
   */
  private createMockLibrary(): any {
    const React = this.getReact();
    
    const createMockComponent = (name: string) => {
      return (props: any) => {
        return React.createElement('div', {
          className: `tmyl-${name.toLowerCase()} tmyl-mock-component`,
          'data-type': name,
          style: {
            padding: '1rem',
            border: '2px dashed #ccc',
            borderRadius: '0.375rem',
            background: '#f8f9fa',
            color: '#6c757d',
            fontFamily: 'monospace',
            textAlign: 'center',
            margin: '0.5rem',
          }
        }, `Mock ${name} component`);
      };
    };

    return {
      Button: createMockComponent('Button'),
      Card: createMockComponent('Card'),
      Input: createMockComponent('Input'),
      SearchBar: createMockComponent('SearchBar'),
      ActionCard: createMockComponent('ActionCard'),
      ContentCard: createMockComponent('ContentCard'),
      Notification: createMockComponent('Notification'),
      FileList: createMockComponent('FileList'),
      Dashboard: createMockComponent('Dashboard'),
      SearchInterface: createMockComponent('SearchInterface'),
      ContentManager: createMockComponent('ContentManager'),
      EnhancedSearch: createMockComponent('EnhancedSearch'),
      CampaignSelector: createMockComponent('CampaignSelector'),
      updateTheme: (theme: any) => console.log('Mock: React theme updated to', theme.name),
      updateTokens: (tokens: any) => console.log('Mock: React tokens updated', tokens),
    };
  }
}
