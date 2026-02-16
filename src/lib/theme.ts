/**
 * Theme Management Module
 * Handles theme switching between dark/light modes
 */

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'theme-preference';

/**
 * Get the system's preferred color scheme
 */
export function getSystemDefault(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Get the current theme preference from localStorage (falls back to system default)
 */
export function getTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    return getSystemDefault();
}

/**
 * Set theme preference and save to localStorage
 */
export function setTheme(mode: ThemeMode): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
}

/**
 * Apply theme to document
 */
export function applyTheme(mode: ThemeMode = getTheme()): void {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', mode);
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
    if (typeof window === 'undefined') return;
    applyTheme();
}
