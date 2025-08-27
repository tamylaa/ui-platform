/**
 * Vanilla JavaScript Framework Adapter
 *
 * Bridges the platform to @tamyla/ui-components (vanilla JS)
 */
class VanillaAdapter {
    constructor(config) {
        this.config = config;
        this.loadComponentLibrary();
    }
    /**
     * Create a component using the vanilla JS library
     */
    createComponent(type, props = {}) {
        if (!this.componentLibrary) {
            throw new Error('Vanilla JS component library not loaded');
        }
        const enhancedProps = {
            ...props,
            theme: this.config.theme,
            className: `tmyl-${type} ${props.className || ''}`.trim(),
        };
        // Map component types to factory functions
        const componentMap = {
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
    updateTheme(theme) {
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
    updateTokens(tokens) {
        if (this.componentLibrary && typeof this.componentLibrary.updateTokens === 'function') {
            this.componentLibrary.updateTokens(tokens);
        }
    }
    /**
     * Get framework identifier
     */
    getFramework() {
        return 'vanilla';
    }
    /**
     * Load the vanilla JS component library
     */
    async loadComponentLibrary() {
        try {
            // For now, we'll use the mock library since packages aren't migrated yet
            console.log('Loading vanilla JS component library...');
            this.componentLibrary = this.createMockLibrary();
        }
        catch (error) {
            console.warn('Could not load @tamyla/ui-components:', error);
            this.componentLibrary = this.createMockLibrary();
        }
    }
    /**
     * Create mock component library for development/testing
     */
    createMockLibrary() {
        const createMockComponent = (type) => (props) => {
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
            setTheme: (theme) => console.log('Mock: Theme updated to', theme.name),
            updateTokens: (tokens) => console.log('Mock: Tokens updated', tokens),
        };
    }
}

/**
 * React Framework Adapter
 *
 * Bridges the platform to @tamyla/ui-components-react
 */
class ReactAdapter {
    constructor(config) {
        this.config = config;
        this.loadComponentLibrary();
    }
    /**
     * Create a component using the React library
     */
    createComponent(type, props = {}) {
        if (!this.componentLibrary) {
            throw new Error('React component library not loaded');
        }
        const enhancedProps = {
            ...props,
            theme: this.config.theme,
            className: `tmyl-${type} ${props.className || ''}`.trim(),
        };
        // Map component types to React components
        const componentMap = {
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
    updateTheme(theme) {
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
    updateTokens(tokens) {
        if (this.componentLibrary && typeof this.componentLibrary.updateTokens === 'function') {
            this.componentLibrary.updateTokens(tokens);
        }
    }
    /**
     * Get framework identifier
     */
    getFramework() {
        return 'react';
    }
    /**
     * Get React instance
     */
    getReact() {
        // Try to get React from various sources
        if (typeof window !== 'undefined' && window.React) {
            return window.React;
        }
        try {
            return require('react');
        }
        catch (e) {
            throw new Error('React is required but not found. Please install React.');
        }
    }
    /**
     * Load the React component library
     */
    async loadComponentLibrary() {
        try {
            // For now, we'll use the mock library since packages aren't migrated yet
            console.log('Loading React component library...');
            this.componentLibrary = this.createMockLibrary();
        }
        catch (error) {
            console.warn('Could not load @tamyla/ui-components-react:', error);
            this.componentLibrary = this.createMockLibrary();
        }
    }
    /**
     * Create mock component library for development/testing
     */
    createMockLibrary() {
        const React = this.getReact();
        const createMockComponent = (name) => {
            return (props) => {
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
            updateTheme: (theme) => console.log('Mock: React theme updated to', theme.name),
            updateTokens: (tokens) => console.log('Mock: React tokens updated', tokens),
        };
    }
}

/**
 * Design Token Manager
 *
 * Centralizes and manages design tokens shared across all components
 */
class TokenManager {
    constructor(customTokens = {}) {
        this.customTokens = customTokens;
        this.tokens = this.createDefaultTokens();
        this.mergeCustomTokens();
    }
    /**
     * Get all tokens
     */
    getTokens() {
        return { ...this.tokens };
    }
    /**
     * Update tokens with new values
     */
    updateTokens(newTokens) {
        this.customTokens = { ...this.customTokens, ...newTokens };
        this.mergeCustomTokens();
    }
    /**
     * Get specific token category
     */
    getColors() {
        return this.tokens.colors;
    }
    getSpacing() {
        return this.tokens.spacing;
    }
    getTypography() {
        return this.tokens.typography;
    }
    getBorders() {
        return this.tokens.borders;
    }
    getShadows() {
        return this.tokens.shadows;
    }
    getTransitions() {
        return this.tokens.transitions;
    }
    getZIndex() {
        return this.tokens.zIndex;
    }
    /**
     * Create default design tokens
     */
    createDefaultTokens() {
        return {
            colors: {
                // Primary palette
                primary: '#007bff',
                primaryHover: '#0056b3',
                primaryActive: '#004085',
                primaryLight: '#cce7ff',
                primaryDark: '#002752',
                // Secondary palette
                secondary: '#6c757d',
                secondaryHover: '#545b62',
                secondaryActive: '#3d4449',
                secondaryLight: '#e2e3e5',
                secondaryDark: '#1e2124',
                // Status colors
                success: '#28a745',
                successHover: '#1e7e34',
                successLight: '#d4edda',
                warning: '#ffc107',
                warningHover: '#d39e00',
                warningLight: '#fff3cd',
                error: '#dc3545',
                errorHover: '#bd2130',
                errorLight: '#f8d7da',
                info: '#17a2b8',
                infoHover: '#117a8b',
                infoLight: '#d1ecf1',
                // Neutral colors
                white: '#ffffff',
                black: '#000000',
                gray50: '#f8f9fa',
                gray100: '#e9ecef',
                gray200: '#dee2e6',
                gray300: '#ced4da',
                gray400: '#adb5bd',
                gray500: '#6c757d',
                gray600: '#495057',
                gray700: '#343a40',
                gray800: '#212529',
                gray900: '#0d1117',
                // Background colors
                background: '#ffffff',
                backgroundAlt: '#f8f9fa',
                surface: '#ffffff',
                surfaceAlt: '#f1f3f4',
                // Text colors
                text: '#212529',
                textSecondary: '#6c757d',
                textMuted: '#adb5bd',
                textInverse: '#ffffff',
                // Border colors
                border: '#dee2e6',
                borderLight: '#e9ecef',
                borderDark: '#adb5bd',
            },
            spacing: {
                px: '1px',
                0: '0',
                1: '0.25rem', // 4px
                2: '0.5rem', // 8px
                3: '0.75rem', // 12px
                4: '1rem', // 16px
                5: '1.25rem', // 20px
                6: '1.5rem', // 24px
                8: '2rem', // 32px
                10: '2.5rem', // 40px
                12: '3rem', // 48px
                16: '4rem', // 64px
                20: '5rem', // 80px
                24: '6rem', // 96px
                32: '8rem', // 128px
                40: '10rem', // 160px
                48: '12rem', // 192px
                56: '14rem', // 224px
                64: '16rem', // 256px
            },
            typography: {
                fontFamily: {
                    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                },
                fontSize: {
                    xs: '0.75rem', // 12px
                    sm: '0.875rem', // 14px
                    md: '1rem', // 16px
                    lg: '1.125rem', // 18px
                    xl: '1.25rem', // 20px
                    '2xl': '1.5rem', // 24px
                    '3xl': '1.875rem', // 30px
                    '4xl': '2.25rem', // 36px
                    '5xl': '3rem', // 48px
                    '6xl': '3.75rem', // 60px
                },
                fontWeight: {
                    thin: 100,
                    light: 300,
                    normal: 400,
                    medium: 500,
                    semibold: 600,
                    bold: 700,
                    extrabold: 800,
                    black: 900,
                },
                lineHeight: {
                    none: 1,
                    tight: 1.25,
                    snug: 1.375,
                    normal: 1.5,
                    relaxed: 1.625,
                    loose: 2,
                },
                letterSpacing: {
                    tighter: '-0.05em',
                    tight: '-0.025em',
                    normal: '0',
                    wide: '0.025em',
                    wider: '0.05em',
                    widest: '0.1em',
                },
            },
            borders: {
                none: 'none',
                sm: '1px solid',
                md: '2px solid',
                lg: '4px solid',
                dashed: '1px dashed',
                dotted: '1px dotted',
            },
            shadows: {
                none: 'none',
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                focus: '0 0 0 3px rgba(0, 123, 255, 0.25)',
            },
            transitions: {
                none: 'none',
                fast: 'all 0.15s ease-in-out',
                normal: 'all 0.3s ease-in-out',
                slow: 'all 0.5s ease-in-out',
                bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            zIndex: {
                auto: 0,
                base: 0,
                hide: -1,
                overlay: 1000,
                dropdown: 1010,
                sticky: 1020,
                banner: 1030,
                modal: 1040,
                popover: 1050,
                tooltip: 1060,
                toast: 1070,
                max: 9999,
            },
        };
    }
    /**
     * Merge custom tokens with defaults
     */
    mergeCustomTokens() {
        // Deep merge custom tokens
        this.tokens = this.deepMerge(this.tokens, this.customTokens);
    }
    /**
     * Deep merge utility
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    /**
     * Generate CSS custom properties from tokens
     */
    generateCSSCustomProperties() {
        const css = [':root {'];
        const flattenTokens = (tokens, prefix = '') => {
            for (const [key, value] of Object.entries(tokens)) {
                if (typeof value === 'object' && value !== null) {
                    flattenTokens(value, `${prefix}${key}-`);
                }
                else {
                    css.push(`  --tmyl-${prefix}${key}: ${value};`);
                }
            }
        };
        flattenTokens(this.tokens);
        css.push('}');
        return css.join('\n');
    }
}

/**
 * Theme Manager
 *
 * Manages themes and provides theme switching capabilities
 */
class ThemeManager {
    constructor(initialTheme = 'default', tokenManager) {
        this.tokenManager = tokenManager;
        this.themes = new Map();
        this.initializeDefaultThemes();
        this.setTheme(initialTheme);
    }
    /**
     * Get current theme
     */
    getCurrentTheme() {
        return { ...this.currentTheme };
    }
    /**
     * Set active theme
     */
    setTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.warn(`Theme "${themeName}" not found. Using default theme.`);
            this.currentTheme = this.themes.get('default');
            return;
        }
        this.currentTheme = theme;
        this.applyThemeToDocument();
    }
    /**
     * Register a new theme
     */
    registerTheme(name, theme) {
        this.themes.set(name, theme);
    }
    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }
    /**
     * Get specific theme by name
     */
    getTheme(name) {
        return this.themes.get(name);
    }
    /**
     * Create a new theme based on existing theme
     */
    createTheme(name, baseTheme = 'default', overrides = {}) {
        const base = this.themes.get(baseTheme);
        if (!base) {
            throw new Error(`Base theme "${baseTheme}" not found`);
        }
        const newTheme = this.deepMerge(base, overrides);
        newTheme.name = name;
        this.registerTheme(name, newTheme);
        return newTheme;
    }
    /**
     * Initialize default themes
     */
    initializeDefaultThemes() {
        const tokens = this.tokenManager.getTokens();
        // Default light theme
        const defaultTheme = {
            name: 'default',
            colors: {
                primary: tokens.colors.primary,
                secondary: tokens.colors.secondary,
                success: tokens.colors.success,
                warning: tokens.colors.warning,
                error: tokens.colors.error,
                neutral: tokens.colors.gray500,
                background: tokens.colors.background,
                surface: tokens.colors.surface,
                text: tokens.colors.text,
                textSecondary: tokens.colors.textSecondary,
            },
            spacing: {
                xs: tokens.spacing[2],
                sm: tokens.spacing[3],
                md: tokens.spacing[4],
                lg: tokens.spacing[6],
                xl: tokens.spacing[8],
            },
            typography: {
                fontFamily: tokens.typography.fontFamily.sans,
                fontSize: {
                    xs: tokens.typography.fontSize.xs,
                    sm: tokens.typography.fontSize.sm,
                    md: tokens.typography.fontSize.md,
                    lg: tokens.typography.fontSize.lg,
                    xl: tokens.typography.fontSize.xl,
                },
                fontWeight: {
                    normal: tokens.typography.fontWeight.normal,
                    medium: tokens.typography.fontWeight.medium,
                    bold: tokens.typography.fontWeight.bold,
                },
            },
            borderRadius: {
                sm: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
            },
            shadows: {
                sm: tokens.shadows.sm,
                md: tokens.shadows.md,
                lg: tokens.shadows.lg,
            },
            breakpoints: {
                mobile: '480px',
                tablet: '768px',
                desktop: '1024px',
            },
        };
        // Dark theme
        const darkTheme = {
            ...defaultTheme,
            name: 'dark',
            colors: {
                ...defaultTheme.colors,
                background: tokens.colors.gray900,
                surface: tokens.colors.gray800,
                text: tokens.colors.textInverse,
                textSecondary: tokens.colors.gray300,
                neutral: tokens.colors.gray400,
            },
        };
        // Professional theme
        const professionalTheme = {
            ...defaultTheme,
            name: 'professional',
            colors: {
                ...defaultTheme.colors,
                primary: '#2563eb',
                secondary: '#64748b',
                background: '#fafafa',
                surface: '#ffffff',
            },
        };
        // Trading theme (for financial applications)
        const tradingTheme = {
            ...defaultTheme,
            name: 'trading',
            colors: {
                ...defaultTheme.colors,
                primary: '#059669',
                secondary: '#0f172a',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                background: '#0f172a',
                surface: '#1e293b',
                text: '#f1f5f9',
                textSecondary: '#94a3b8',
            },
        };
        this.themes.set('default', defaultTheme);
        this.themes.set('light', defaultTheme);
        this.themes.set('dark', darkTheme);
        this.themes.set('professional', professionalTheme);
        this.themes.set('trading', tradingTheme);
    }
    /**
     * Apply theme to document (CSS custom properties)
     */
    applyThemeToDocument() {
        if (typeof document === 'undefined')
            return;
        const root = document.documentElement;
        const theme = this.currentTheme;
        // Apply color variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-color-${key}`, value);
        });
        // Apply spacing variables
        Object.entries(theme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-spacing-${key}`, value);
        });
        // Apply typography variables
        root.style.setProperty('--tmyl-font-family', theme.typography.fontFamily);
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-font-size-${key}`, value);
        });
        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-font-weight-${key}`, value.toString());
        });
        // Apply border radius variables
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-radius-${key}`, value);
        });
        // Apply shadow variables
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--tmyl-shadow-${key}`, value);
        });
        // Set theme class on body
        document.body.className = document.body.className
            .replace(/tmyl-theme-\w+/g, '')
            .trim();
        document.body.classList.add(`tmyl-theme-${theme.name}`);
    }
    /**
     * Deep merge utility
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    /**
     * Generate theme CSS
     */
    generateThemeCSS(themeName) {
        const theme = themeName ? this.themes.get(themeName) : this.currentTheme;
        if (!theme)
            return '';
        const css = [];
        css.push(`/* ${theme.name} theme */`);
        css.push(`.tmyl-theme-${theme.name} {`);
        // Colors
        Object.entries(theme.colors).forEach(([key, value]) => {
            css.push(`  --tmyl-color-${key}: ${value};`);
        });
        // Spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
            css.push(`  --tmyl-spacing-${key}: ${value};`);
        });
        // Typography
        css.push(`  --tmyl-font-family: ${theme.typography.fontFamily};`);
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
            css.push(`  --tmyl-font-size-${key}: ${value};`);
        });
        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
            css.push(`  --tmyl-font-weight-${key}: ${value};`);
        });
        // Border radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            css.push(`  --tmyl-radius-${key}: ${value};`);
        });
        // Shadows
        Object.entries(theme.shadows).forEach(([key, value]) => {
            css.push(`  --tmyl-shadow-${key}: ${value};`);
        });
        css.push('}');
        return css.join('\n');
    }
    /**
     * Generate CSS for all themes
     */
    generateAllThemesCSS() {
        return Array.from(this.themes.keys())
            .map(themeName => this.generateThemeCSS(themeName))
            .join('\n\n');
    }
}

/**
 * Tamyla UI Platform - Core Platform Orchestrator
 *
 * This is the main platform interface that provides unified access
 * to both vanilla JS and React components while maintaining framework
 * separation and ensuring consistent evolution of UI elements.
 */
/**
 * Platform class - Central orchestrator for UI components
 *
 * Provides a unified API while maintaining clear separation between
 * vanilla JS and React implementations.
 */
class Platform {
    constructor(config) {
        /**
         * Component factory methods
         */
        this.button = (props) => this.adapter.createComponent('button', props);
        this.card = (props) => this.adapter.createComponent('card', props);
        this.input = (props) => this.adapter.createComponent('input', props);
        // Molecules
        this.searchBar = (props) => this.adapter.createComponent('searchBar', props);
        this.actionCard = (props) => this.adapter.createComponent('actionCard', props);
        this.contentCard = (props) => this.adapter.createComponent('contentCard', props);
        // Organisms
        this.dashboard = (props) => this.adapter.createComponent('dashboard', props);
        this.searchInterface = (props) => this.adapter.createComponent('searchInterface', props);
        // Applications
        this.contentManager = (props) => this.adapter.createComponent('contentManager', props);
        this.enhancedSearch = (props) => this.adapter.createComponent('enhancedSearch', props);
        this.campaignSelector = (props) => this.adapter.createComponent('campaignSelector', props);
        this.config = config;
        this.tokenManager = new TokenManager(config.tokens);
        this.themeManager = new ThemeManager(config.theme, this.tokenManager);
        this.adapter = this.createAdapter(config.framework);
    }
    /**
     * Create a new Platform instance
     */
    static create(config = {}) {
        const defaultConfig = {
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
     * Generic component factory
     */
    create(type, props = {}) {
        return this.adapter.createComponent(type, {
            ...props,
            theme: this.themeManager.getCurrentTheme(),
            tokens: this.tokenManager.getTokens()
        });
    }
    /**
     * Theme management
     */
    setTheme(themeName) {
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
    updateTokens(tokens) {
        this.tokenManager.updateTokens(tokens);
        this.adapter.updateTokens(this.tokenManager.getTokens());
    }
    /**
     * Framework detection and adapter creation
     */
    createAdapter(framework) {
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
    detectFramework() {
        // Check if React is available
        if (typeof window !== 'undefined' && window.React) {
            return 'react';
        }
        // Check if we're in a React context
        try {
            const react = require('react');
            if (react && react.version) {
                return 'react';
            }
        }
        catch (e) {
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
const platform = Platform.create();
/**
 * Convenience exports for direct component access
 */
const { button, card, input, searchBar, actionCard, contentCard, dashboard, searchInterface, contentManager, enhancedSearch, campaignSelector, create: create$1 } = platform;

/**
 * React Exports
 *
 * React-specific components and utilities
 */
// Create React-specific platform instance
const reactPlatform = Platform.create({ framework: 'react' });
// Export React component factories
const Button = reactPlatform.button;
const Card = reactPlatform.card;
const Input = reactPlatform.input;
const SearchBar = reactPlatform.searchBar;
const ActionCard = reactPlatform.actionCard;
const ContentCard = reactPlatform.contentCard;
const Dashboard = reactPlatform.dashboard;
const SearchInterface = reactPlatform.searchInterface;
const ContentManager = reactPlatform.contentManager;
const EnhancedSearch = reactPlatform.enhancedSearch;
const CampaignSelector = reactPlatform.campaignSelector;
// Export generic factory
const create = reactPlatform.create;
// React-specific utilities
const PlatformProvider = ({ children, theme = 'default' }) => {
    // This would be a proper React context provider
    // For now, just return children with theme applied
    if (typeof window !== 'undefined') {
        reactPlatform.setTheme(theme);
    }
    return children;
};

export { ActionCard, Button, CampaignSelector, Card, ContentCard, ContentManager, Dashboard, EnhancedSearch, Input, PlatformProvider, SearchBar, SearchInterface, create, reactPlatform as platform };
//# sourceMappingURL=index.esm.js.map
