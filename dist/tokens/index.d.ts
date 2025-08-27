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

export { TokenManager, defaultTokens };
export type { DesignTokens };
