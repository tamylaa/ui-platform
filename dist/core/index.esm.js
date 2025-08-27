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
 * Core Exports
 *
 * Core platform utilities, theme management, and design system
 */
// Utility functions
const createTheme = (name, theme) => {
    const defaultTheme = {
        name,
        colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            neutral: '#6c757d',
            background: '#ffffff',
            surface: '#ffffff',
            text: '#212529',
            textSecondary: '#6c757d',
        },
        spacing: {
            xs: '0.5rem',
            sm: '0.75rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
        },
        typography: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                md: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
            },
            fontWeight: {
                normal: 400,
                medium: 500,
                bold: 700,
            },
        },
        borderRadius: {
            sm: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        breakpoints: {
            mobile: '480px',
            tablet: '768px',
            desktop: '1024px',
        },
    };
    return { ...defaultTheme, ...theme, name };
};

export { ThemeManager, createTheme };
//# sourceMappingURL=index.esm.js.map
