'use strict';

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
 * Design Tokens Exports
 *
 * Design tokens and token management utilities
 */
// Default token sets
const defaultTokens = {
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        white: '#ffffff',
        black: '#000000',
        gray100: '#f8f9fa',
        gray200: '#e9ecef',
        gray300: '#dee2e6',
        gray400: '#ced4da',
        gray500: '#adb5bd',
        gray600: '#6c757d',
        gray700: '#495057',
        gray800: '#343a40',
        gray900: '#212529',
    },
    spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
    },
    typography: {
        fontFamily: {
            sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
};

exports.TokenManager = TokenManager;
exports.defaultTokens = defaultTokens;
//# sourceMappingURL=index.cjs.map
