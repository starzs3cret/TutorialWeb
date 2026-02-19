import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'warm-dark' | 'cool-dark' | 'soft-light' | 'dim';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    availableThemes: { id: Theme; name: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const availableThemes: { id: Theme; name: string }[] = [
    { id: 'warm-dark', name: 'Warm Dark' },
    { id: 'cool-dark', name: 'Cool Dark' },
    { id: 'soft-light', name: 'Soft Light' },
    { id: 'dim', name: 'Dim' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return availableThemes.find((t) => t.id === savedTheme) ? savedTheme : 'warm-dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove old theme classes
        availableThemes.forEach((t) => root.classList.remove(t.id));
        // Add new theme class
        root.classList.add(theme);
        // Persist
        localStorage.setItem('theme', theme);
        // Also set data-theme attribute for easier CSS selection if needed
        root.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
