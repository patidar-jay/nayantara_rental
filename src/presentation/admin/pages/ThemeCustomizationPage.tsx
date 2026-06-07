// ============================================================================
// ThemeCustomizationPage — Admin theme editor
// Change brand color + background color with live preview
// ============================================================================

import { useState } from 'react';
import { useTheme, DEFAULT_THEME } from '@presentation/shared/ThemeContext';
import { useToast } from '@presentation/shared/Toast';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Preset Palettes
// ---------------------------------------------------------------------------

interface ColorPreset {
  name: string;
  hex: string;
}

const BRAND_PRESETS: ColorPreset[] = [
  { name: 'Indigo',    hex: '#4c6ef5' },
  { name: 'Blue',      hex: '#228be6' },
  { name: 'Cyan',      hex: '#15aabf' },
  { name: 'Teal',      hex: '#12b886' },
  { name: 'Green',     hex: '#40c057' },
  { name: 'Lime',      hex: '#82c91e' },
  { name: 'Yellow',    hex: '#fab005' },
  { name: 'Orange',    hex: '#fd7e14' },
  { name: 'Red',       hex: '#fa5252' },
  { name: 'Pink',      hex: '#e64980' },
  { name: 'Grape',     hex: '#be4bdb' },
  { name: 'Violet',    hex: '#7950f2' },
  { name: 'Rose Gold', hex: '#c76e6e' },
  { name: 'Emerald',   hex: '#059669' },
  { name: 'Sky',       hex: '#0ea5e9' },
  { name: 'Fuchsia',   hex: '#d946ef' },
  { name: 'Amber',     hex: '#d97706' },
  { name: 'Slate',     hex: '#64748b' },
];

const BG_PRESETS: ColorPreset[] = [
  // Dark
  { name: 'Midnight',      hex: '#0a0a0f' },
  { name: 'Charcoal',      hex: '#121212' },
  { name: 'Dark Navy',     hex: '#0a0e1a' },
  { name: 'Dark Slate',    hex: '#0f172a' },
  // Colorful Dark
  { name: 'Navy Blue',     hex: '#1e2a4a' },
  { name: 'Dark Teal',     hex: '#0d3b3e' },
  { name: 'Dark Green',    hex: '#14352a' },
  { name: 'Dark Purple',   hex: '#2d1b4e' },
  { name: 'Dark Maroon',   hex: '#3b1a1a' },
  { name: 'Dark Brown',    hex: '#2c1810' },
  // Colorful Medium
  { name: 'Blue',          hex: '#1a3a5c' },
  { name: 'Teal',          hex: '#1a4a4a' },
  { name: 'Green',         hex: '#1a3c2a' },
  { name: 'Purple',        hex: '#3a2260' },
  { name: 'Maroon',        hex: '#5c1a1a' },
  { name: 'Wine',          hex: '#4a1a35' },
  { name: 'Brown',         hex: '#3e2a1a' },
  { name: 'Gray',          hex: '#3a3a3a' },
  // Light
  { name: 'White',         hex: '#ffffff' },
  { name: 'Light Gray',    hex: '#f0f0f0' },
  { name: 'Cream',         hex: '#fdf6e3' },
  { name: 'Light Blue',    hex: '#e8f0fe' },
  { name: 'Light Pink',    hex: '#fce4ec' },
  { name: 'Light Green',   hex: '#e8f5e9' },
];

// ---------------------------------------------------------------------------
// Color Swatch Component
// ---------------------------------------------------------------------------

function ColorSwatch({
  preset,
  isSelected,
  onClick,
}: {
  preset: ColorPreset;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all',
        isSelected
          ? 'bg-white/10 ring-2 ring-brand-500'
          : 'hover:bg-white/5'
      )}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-lg border-2 transition-transform group-hover:scale-110',
          isSelected ? 'border-white' : 'border-white/10'
        )}
        style={{ backgroundColor: preset.hex }}
      />
      <span className="text-[10px] font-medium text-gray-400 leading-none">{preset.name}</span>
      <span className="text-[9px] font-mono text-gray-600 leading-none uppercase">{preset.hex}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ThemeCustomizationPage() {
  const { colors, setColors, resetToDefaults } = useTheme();
  const toast = useToast();

  const [brandHex, setBrandHex] = useState(colors.brand);
  const [bgHex, setBgHex] = useState(colors.background);
  const [brandInput, setBrandInput] = useState(colors.brand);
  const [bgInput, setBgInput] = useState(colors.background);
  const [brandSearch, setBrandSearch] = useState('');
  const [bgSearch, setBgSearch] = useState('');

  const filteredBrandPresets = brandSearch.trim()
    ? BRAND_PRESETS.filter((p) => p.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : BRAND_PRESETS;

  const filteredBgPresets = bgSearch.trim()
    ? BG_PRESETS.filter((p) => p.name.toLowerCase().includes(bgSearch.toLowerCase()))
    : BG_PRESETS;

  const isValidHex = (hex: string) => /^#[0-9a-fA-F]{6}$/.test(hex);

  const handleBrandSelect = (hex: string) => {
    setBrandHex(hex);
    setBrandInput(hex);
    setColors({ brand: hex, background: bgHex });
  };

  const handleBgSelect = (hex: string) => {
    setBgHex(hex);
    setBgInput(hex);
    setColors({ brand: brandHex, background: hex });
  };

  const handleBrandInputChange = (value: string) => {
    setBrandInput(value);
    if (isValidHex(value)) {
      setBrandHex(value);
      setColors({ brand: value, background: bgHex });
    }
  };

  const handleBgInputChange = (value: string) => {
    setBgInput(value);
    if (isValidHex(value)) {
      setBgHex(value);
      setColors({ brand: brandHex, background: value });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setBrandHex(DEFAULT_THEME.brand);
    setBgHex(DEFAULT_THEME.background);
    setBrandInput(DEFAULT_THEME.brand);
    setBgInput(DEFAULT_THEME.background);
    toast.success('Theme reset to defaults');
  };

  const handleSave = () => {
    setColors({ brand: brandHex, background: bgHex });
    toast.success('Theme saved successfully');
  };

  const isDefault =
    brandHex === DEFAULT_THEME.brand && bgHex === DEFAULT_THEME.background;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Theme Customization
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your website's brand color and background
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isDefault && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all"
            >
              Reset to Default
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all"
          >
            Save Theme
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 bg-surface-800">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Preview</p>
        </div>
        <div className="p-6" style={{ backgroundColor: bgHex }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: brandHex }}
            >
              N
            </div>
            <div>
              <p className="text-sm font-bold text-white">Nayantara <span style={{ color: brandHex }}>Rentals</span></p>
              <p className="text-[10px] text-gray-500">Your website header preview</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all"
              style={{ backgroundColor: brandHex }}
            >
              Browse Collection
            </button>
            <button
              className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-300"
              style={{ borderColor: `${brandHex}40` }}
            >
              Track Booking
            </button>
          </div>
        </div>
      </div>

      {/* Brand Color Section */}
      <div className="rounded-2xl bg-surface-800 border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-md" style={{ backgroundColor: brandHex }} />
            <div>
              <h2 className="text-base font-semibold text-white">Brand / Theme Color</h2>
              <p className="text-xs text-gray-500">Buttons, links, active states, and accents</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Inputs Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="relative">
                <input
                  type="color"
                  value={brandHex}
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                  Color Code
                </label>
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => handleBrandInputChange(e.target.value)}
                  placeholder="#4c6ef5"
                  maxLength={7}
                  className={cn(
                    'w-full rounded-lg bg-surface-700 border px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all',
                    isValidHex(brandInput) ? 'border-white/5 focus:ring-brand-500/50' : 'border-red-500/50 focus:ring-red-500/50'
                  )}
                />
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                Search by Name
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="e.g. Red, Teal, Violet..."
                  className="w-full rounded-lg bg-surface-700 border border-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Color Grid */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-3">
              {brandSearch.trim() ? `Matching "${brandSearch}" — ${filteredBrandPresets.length} found` : 'Preset Colors'}
            </p>
            {filteredBrandPresets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1">
                {filteredBrandPresets.map((preset) => (
                  <ColorSwatch
                    key={preset.hex}
                    preset={preset}
                    isSelected={brandHex.toLowerCase() === preset.hex.toLowerCase()}
                    onClick={() => { handleBrandSelect(preset.hex); setBrandSearch(''); }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 py-4 text-center">No colors match "{brandSearch}". Try another name or use the color picker.</p>
            )}
          </div>
        </div>
      </div>

      {/* Background Color Section */}
      <div className="rounded-2xl bg-surface-800 border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-md border border-white/20" style={{ backgroundColor: bgHex }} />
            <div>
              <h2 className="text-base font-semibold text-white">Background Color</h2>
              <p className="text-xs text-gray-500">Page background and surface shades</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Inputs Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="relative">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => handleBgSelect(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                  Color Code
                </label>
                <input
                  type="text"
                  value={bgInput}
                  onChange={(e) => handleBgInputChange(e.target.value)}
                  placeholder="#0a0a0f"
                  maxLength={7}
                  className={cn(
                    'w-full rounded-lg bg-surface-700 border px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all',
                    isValidHex(bgInput) ? 'border-white/5 focus:ring-brand-500/50' : 'border-red-500/50 focus:ring-red-500/50'
                  )}
                />
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                Search by Name
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  type="text"
                  value={bgSearch}
                  onChange={(e) => setBgSearch(e.target.value)}
                  placeholder="e.g. Midnight, Charcoal..."
                  className="w-full rounded-lg bg-surface-700 border border-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Color Grid */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-3">
              {bgSearch.trim() ? `Matching "${bgSearch}" — ${filteredBgPresets.length} found` : 'Preset Backgrounds'}
            </p>
            {filteredBgPresets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
                {filteredBgPresets.map((preset) => (
                  <ColorSwatch
                    key={preset.hex}
                    preset={preset}
                    isSelected={bgHex.toLowerCase() === preset.hex.toLowerCase()}
                    onClick={() => { handleBgSelect(preset.hex); setBgSearch(''); }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 py-4 text-center">No backgrounds match "{bgSearch}". Try another name or use the color picker.</p>
            )}
          </div>
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="rounded-2xl bg-surface-800 border border-white/5 p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Current Theme</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: brandHex }} />
            <div>
              <p className="text-gray-400 text-xs">Brand Color</p>
              <p className="text-white font-mono text-xs">{brandHex}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-white/10" style={{ backgroundColor: bgHex }} />
            <div>
              <p className="text-gray-400 text-xs">Background</p>
              <p className="text-white font-mono text-xs">{bgHex}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
