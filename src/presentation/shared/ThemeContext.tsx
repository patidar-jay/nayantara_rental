// ============================================================================
// ThemeContext — Dynamic theme customization via CSS custom properties
//
// Stores 5-color theme settings in localStorage and applies them on :root.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  border: string;
}

interface ThemeContextValue {
  colors: ThemeColors;
  setColors: (colors: ThemeColors) => void;
  resetToDefaults: () => void;
}

// ---------------------------------------------------------------------------
// Defaults (match index.css @theme values)
// ---------------------------------------------------------------------------

export const DEFAULT_THEME: ThemeColors = {
  background: '#0F0F14',
  surface: '#1A1A24',
  primary: '#C8A96B',
  text: '#FFFFFF',
  border: 'rgba(200, 169, 107, 0.15)',
};

const STORAGE_KEY = 'nayantara_theme_v2';

// ---------------------------------------------------------------------------
// Apply to DOM
// ---------------------------------------------------------------------------

function applyThemeToDOM(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-border', colors.border);
}

function clearThemeFromDOM() {
  const root = document.documentElement;
  root.style.removeProperty('--theme-background');
  root.style.removeProperty('--theme-surface');
  root.style.removeProperty('--theme-primary');
  root.style.removeProperty('--theme-text');
  root.style.removeProperty('--theme-border');
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ThemeColors;
    } catch { /* ignore */ }
    return DEFAULT_THEME;
  });

  // Apply on mount and when colors change
  useEffect(() => {
    const isDefault =
      colors.background === DEFAULT_THEME.background &&
      colors.surface === DEFAULT_THEME.surface &&
      colors.primary === DEFAULT_THEME.primary &&
      colors.text === DEFAULT_THEME.text &&
      colors.border === DEFAULT_THEME.border;

    if (isDefault) {
      clearThemeFromDOM();
    } else {
      applyThemeToDOM(colors);
    }
  }, [colors]);

  const setColors = useCallback((next: ThemeColors) => {
    setColorsState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetToDefaults = useCallback(() => {
    setColorsState(DEFAULT_THEME);
    localStorage.removeItem(STORAGE_KEY);
    clearThemeFromDOM();
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, setColors, resetToDefaults }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
