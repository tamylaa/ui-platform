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
 * Core Exports
 *
 * Core platform utilities, theme management, and design system
 */

declare const createTheme: (name: string, theme: Partial<Theme>) => Theme;

export { ThemeManager, createTheme };
export type { Theme };
