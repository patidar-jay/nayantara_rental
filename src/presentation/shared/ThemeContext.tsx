// ============================================================================
// ThemeContext — Dynamic theme customization via CSS custom properties
//
// Stores theme settings in localStorage and applies them as inline styles
// on the <html> element, overriding the Tailwind @theme defaults.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeColors {
  brand: string;       // hex e.g. "#4c6ef5"
  background: string;  // hex e.g. "#0a0a0f"
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
  brand: '#4c6ef5',
  background: '#0a0a0f',
};

const STORAGE_KEY = 'nayantara_theme';

// ---------------------------------------------------------------------------
// Color math helpers
// ---------------------------------------------------------------------------

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const val = Math.round(l * 255);
    return `#${val.toString(16).padStart(2, '0').repeat(3)}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h / 360) * 255);
  const b = Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Generate a 10-shade palette from a single hex color (50–900). */
function generatePalette(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);
  // Lightness values for shades 50..900
  const shades: [string, number][] = [
    ['50',  0.96], ['100', 0.90], ['200', 0.80], ['300', 0.70],
    ['400', 0.60], ['500', 0.50], ['600', 0.40], ['700', 0.35],
    ['800', 0.28], ['900', 0.22], ['950', 0.12],
  ];
  const palette: Record<string, string> = {};
  for (const [shade, lightness] of shades) {
    palette[shade] = hslToHex(h, s, lightness);
  }
  return palette;
}

/** Generate surface shades from a background hex (dark theme). */
function generateSurfaces(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);
  return {
    '950': hslToHex(h, s, 0.04),
    '900': hslToHex(h, s, 0.07),
    '800': hslToHex(h, s, 0.10),
    '700': hslToHex(h, s, 0.14),
    '600': hslToHex(h, s, 0.18),
  };
}

// ---------------------------------------------------------------------------
// Apply to DOM
// ---------------------------------------------------------------------------

function applyThemeToDOM(colors: ThemeColors) {
  const root = document.documentElement;
  const brandPalette = generatePalette(colors.brand);
  const surfaces = generateSurfaces(colors.background);

  // Brand colors
  for (const [shade, value] of Object.entries(brandPalette)) {
    root.style.setProperty(`--color-brand-${shade}`, value);
  }

  // Surface colors
  for (const [shade, value] of Object.entries(surfaces)) {
    root.style.setProperty(`--color-surface-${shade}`, value);
  }

  // Update gradient-text
  root.style.setProperty(
    '--gradient-brand',
    `linear-gradient(135deg, ${brandPalette['500']} 0%, ${brandPalette['400']} 40%, #ffa94d 100%)`,
  );
}

function clearThemeFromDOM() {
  const root = document.documentElement;
  const props = [
    ...['50','100','200','300','400','500','600','700','800','900','950'].map(s => `--color-brand-${s}`),
    ...['950','900','800','700','600'].map(s => `--color-surface-${s}`),
    '--gradient-brand',
  ];
  for (const prop of props) {
    root.style.removeProperty(prop);
  }
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
      colors.brand === DEFAULT_THEME.brand &&
      colors.background === DEFAULT_THEME.background;

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
