/**
 * Core Platform Type Definitions
 *
 * Defines the interfaces and types for the UI Platform system
 */
interface PlatformConfig {
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
interface PlatformInstance {
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
    create: (type: string, props?: any) => any;
    setTheme: (themeName: string) => void;
    getTheme: () => any;
    getTokens: () => any;
    updateTokens: (tokens: Record<string, any>) => void;
    getConfig: () => PlatformConfig;
    getVersion: () => string;
    getFramework: () => string;
    debug: () => any;
}
interface Theme {
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
interface DesignTokens {
    colors: Record<string, string>;
    spacing: Record<string, string>;
    typography: Record<string, any>;
    borders: Record<string, string>;
    shadows: Record<string, string>;
    transitions: Record<string, string>;
    zIndex: Record<string, number>;
}
interface ComponentProps {
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
interface ButtonProps extends ComponentProps {
    text?: string;
    type?: 'button' | 'submit' | 'reset';
    icon?: string;
    iconPosition?: 'left' | 'right';
}
interface CardProps extends ComponentProps {
    title?: string;
    content?: string;
    footer?: any;
    padding?: boolean;
    border?: boolean;
    shadow?: boolean;
}
interface InputProps extends ComponentProps {
    placeholder?: string;
    value?: string;
    type?: string;
    label?: string;
    error?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

/**
 * Platform class - Central orchestrator for UI components
 *
 * Provides a unified API while maintaining clear separation between
 * vanilla JS and React implementations.
 */
declare class Platform implements PlatformInstance {
    private adapter;
    private tokenManager;
    private themeManager;
    private config;
    constructor(config: PlatformConfig);
    /**
     * Create a new Platform instance
     */
    static create(config?: Partial<PlatformConfig>): Platform;
    /**
     * Component factory methods
     */
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
    /**
     * Generic component factory
     */
    create(type: string, props?: any): any;
    /**
     * Theme management
     */
    setTheme(themeName: string): void;
    getTheme(): Theme;
    /**
     * Token management
     */
    getTokens(): DesignTokens;
    updateTokens(tokens: Record<string, any>): void;
    /**
     * Framework detection and adapter creation
     */
    private createAdapter;
    /**
     * Auto-detect the current framework environment
     */
    private detectFramework;
    /**
     * Platform utilities
     */
    getConfig(): {
        framework: "vanilla" | "react" | "auto";
        theme: string;
        tokens: Record<string, any>;
        features: {
            animations: boolean;
            accessibility: boolean;
            darkMode: boolean;
            rtl: boolean;
        };
    };
    getVersion(): string;
    getFramework(): string;
    /**
     * Development utilities
     */
    debug(): {
        config: PlatformConfig;
        framework: string;
        theme: Theme;
        tokens: DesignTokens;
        version: string;
    };
}

/**
 * Vanilla JS Exports
 *
 * Direct access to vanilla JavaScript components
 */

declare const vanillaPlatform: Platform;
declare const createButton: (props: any) => any;
declare const createCard: (props: any) => any;
declare const createInput: (props: any) => any;
declare const createSearchBar: (props: any) => any;
declare const createActionCard: (props: any) => any;
declare const createContentCard: (props: any) => any;
declare const createDashboard: (props: any) => any;
declare const createSearchInterface: (props: any) => any;
declare const createContentManager: (props: any) => any;
declare const createEnhancedSearch: (props: any) => any;
declare const createCampaignSelector: (props: any) => any;
declare const create: (type: string, props?: any) => any;

export { create, createActionCard, createButton, createCampaignSelector, createCard, createContentCard, createContentManager, createDashboard, createEnhancedSearch, createInput, createSearchBar, createSearchInterface, vanillaPlatform as platform };
export type { ButtonProps, CardProps, ComponentProps, InputProps };
