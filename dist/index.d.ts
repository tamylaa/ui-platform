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
interface FrameworkAdapter {
    createComponent(type: string, props: any): any;
    updateTheme(theme: any): void;
    updateTokens(tokens: any): void;
    getFramework(): string;
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
 * Default platform instance for quick access
 */
declare const platform: Platform;
/**
 * Convenience exports for direct component access
 */
declare const button: (props: any) => any;
declare const card: (props: any) => any;
declare const input: (props: any) => any;
declare const searchBar: (props: any) => any;
declare const actionCard: (props: any) => any;
declare const contentCard: (props: any) => any;
declare const dashboard: (props: any) => any;
declare const searchInterface: (props: any) => any;
declare const contentManager: (props: any) => any;
declare const enhancedSearch: (props: any) => any;
declare const campaignSelector: (props: any) => any;
declare const create$2: (type: string, props?: any) => any;

/**
 * Design Token Manager
 *
 * Centralizes and manages design tokens shared across all components
 */

declare class TokenManager {
    private tokens;
    private customTokens;
    constructor(customTokens?: Record<string, any>);
    /**
     * Get all tokens
     */
    getTokens(): DesignTokens;
    /**
     * Update tokens with new values
     */
    updateTokens(newTokens: Record<string, any>): void;
    /**
     * Get specific token category
     */
    getColors(): Record<string, string>;
    getSpacing(): Record<string, string>;
    getTypography(): Record<string, any>;
    getBorders(): Record<string, string>;
    getShadows(): Record<string, string>;
    getTransitions(): Record<string, string>;
    getZIndex(): Record<string, number>;
    /**
     * Create default design tokens
     */
    private createDefaultTokens;
    /**
     * Merge custom tokens with defaults
     */
    private mergeCustomTokens;
    /**
     * Deep merge utility
     */
    private deepMerge;
    /**
     * Generate CSS custom properties from tokens
     */
    generateCSSCustomProperties(): string;
}

/**
 * Theme Manager
 *
 * Manages themes and provides theme switching capabilities
 */

declare class ThemeManager {
    private currentTheme;
    private themes;
    private tokenManager;
    constructor(initialTheme: string | undefined, tokenManager: TokenManager);
    /**
     * Get current theme
     */
    getCurrentTheme(): Theme;
    /**
     * Set active theme
     */
    setTheme(themeName: string): void;
    /**
     * Register a new theme
     */
    registerTheme(name: string, theme: Theme): void;
    /**
     * Get all available themes
     */
    getAvailableThemes(): string[];
    /**
     * Get specific theme by name
     */
    getTheme(name: string): Theme | undefined;
    /**
     * Create a new theme based on existing theme
     */
    createTheme(name: string, baseTheme?: string, overrides?: Partial<Theme>): Theme;
    /**
     * Initialize default themes
     */
    private initializeDefaultThemes;
    /**
     * Apply theme to document (CSS custom properties)
     */
    private applyThemeToDocument;
    /**
     * Deep merge utility
     */
    private deepMerge;
    /**
     * Generate theme CSS
     */
    generateThemeCSS(themeName?: string): string;
    /**
     * Generate CSS for all themes
     */
    generateAllThemesCSS(): string;
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
declare const create$1: (type: string, props?: any) => any;

type index$3_ButtonProps = ButtonProps;
type index$3_CardProps = CardProps;
type index$3_ComponentProps = ComponentProps;
type index$3_InputProps = InputProps;
declare const index$3_createActionCard: typeof createActionCard;
declare const index$3_createButton: typeof createButton;
declare const index$3_createCampaignSelector: typeof createCampaignSelector;
declare const index$3_createCard: typeof createCard;
declare const index$3_createContentCard: typeof createContentCard;
declare const index$3_createContentManager: typeof createContentManager;
declare const index$3_createDashboard: typeof createDashboard;
declare const index$3_createEnhancedSearch: typeof createEnhancedSearch;
declare const index$3_createInput: typeof createInput;
declare const index$3_createSearchBar: typeof createSearchBar;
declare const index$3_createSearchInterface: typeof createSearchInterface;
declare namespace index$3 {
  export { create$1 as create, index$3_createActionCard as createActionCard, index$3_createButton as createButton, index$3_createCampaignSelector as createCampaignSelector, index$3_createCard as createCard, index$3_createContentCard as createContentCard, index$3_createContentManager as createContentManager, index$3_createDashboard as createDashboard, index$3_createEnhancedSearch as createEnhancedSearch, index$3_createInput as createInput, index$3_createSearchBar as createSearchBar, index$3_createSearchInterface as createSearchInterface, vanillaPlatform as platform };
  export type { index$3_ButtonProps as ButtonProps, index$3_CardProps as CardProps, index$3_ComponentProps as ComponentProps, index$3_InputProps as InputProps };
}

/**
 * React Exports
 *
 * React-specific components and utilities
 */

declare const reactPlatform: Platform;
declare const Button: (props: any) => any;
declare const Card: (props: any) => any;
declare const Input: (props: any) => any;
declare const SearchBar: (props: any) => any;
declare const ActionCard: (props: any) => any;
declare const ContentCard: (props: any) => any;
declare const Dashboard: (props: any) => any;
declare const SearchInterface: (props: any) => any;
declare const ContentManager: (props: any) => any;
declare const EnhancedSearch: (props: any) => any;
declare const CampaignSelector: (props: any) => any;
declare const create: (type: string, props?: any) => any;

declare const PlatformProvider: ({ children, theme }: any) => any;

declare const index$2_ActionCard: typeof ActionCard;
declare const index$2_Button: typeof Button;
type index$2_ButtonProps = ButtonProps;
declare const index$2_CampaignSelector: typeof CampaignSelector;
declare const index$2_Card: typeof Card;
type index$2_CardProps = CardProps;
type index$2_ComponentProps = ComponentProps;
declare const index$2_ContentCard: typeof ContentCard;
declare const index$2_ContentManager: typeof ContentManager;
declare const index$2_Dashboard: typeof Dashboard;
declare const index$2_EnhancedSearch: typeof EnhancedSearch;
declare const index$2_Input: typeof Input;
type index$2_InputProps = InputProps;
declare const index$2_PlatformProvider: typeof PlatformProvider;
declare const index$2_SearchBar: typeof SearchBar;
declare const index$2_SearchInterface: typeof SearchInterface;
declare const index$2_create: typeof create;
declare namespace index$2 {
  export { index$2_ActionCard as ActionCard, index$2_Button as Button, index$2_CampaignSelector as CampaignSelector, index$2_Card as Card, index$2_ContentCard as ContentCard, index$2_ContentManager as ContentManager, index$2_Dashboard as Dashboard, index$2_EnhancedSearch as EnhancedSearch, index$2_Input as Input, index$2_PlatformProvider as PlatformProvider, index$2_SearchBar as SearchBar, index$2_SearchInterface as SearchInterface, index$2_create as create, reactPlatform as platform };
  export type { index$2_ButtonProps as ButtonProps, index$2_CardProps as CardProps, index$2_ComponentProps as ComponentProps, index$2_InputProps as InputProps };
}

/**
 * Core Exports
 *
 * Core platform utilities, theme management, and design system
 */

declare const createTheme: (name: string, theme: Partial<Theme>) => Theme;

type index$1_Theme = Theme;
type index$1_ThemeManager = ThemeManager;
declare const index$1_ThemeManager: typeof ThemeManager;
declare const index$1_createTheme: typeof createTheme;
declare namespace index$1 {
  export { index$1_ThemeManager as ThemeManager, index$1_createTheme as createTheme };
  export type { index$1_Theme as Theme };
}

/**
 * Design Tokens Exports
 *
 * Design tokens and token management utilities
 */

declare const defaultTokens: {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        white: string;
        black: string;
        gray100: string;
        gray200: string;
        gray300: string;
        gray400: string;
        gray500: string;
        gray600: string;
        gray700: string;
        gray800: string;
        gray900: string;
    };
    spacing: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        8: string;
        10: string;
        12: string;
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
            '2xl': string;
            '3xl': string;
        };
        fontWeight: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
    };
};

type index_DesignTokens = DesignTokens;
type index_TokenManager = TokenManager;
declare const index_TokenManager: typeof TokenManager;
declare const index_defaultTokens: typeof defaultTokens;
declare namespace index {
  export { index_TokenManager as TokenManager, index_defaultTokens as defaultTokens };
  export type { index_DesignTokens as DesignTokens };
}

export { Platform, ThemeManager, TokenManager, actionCard, button, campaignSelector, card, contentCard, contentManager, index$1 as core, create$2 as create, dashboard, enhancedSearch, input, platform, index$2 as react, searchBar, searchInterface, index as tokens, index$3 as vanilla };
export type { ButtonProps, CardProps, ComponentProps, DesignTokens, FrameworkAdapter, InputProps, PlatformConfig, PlatformInstance, Theme };
