// ============================================================================
// ThemeCustomizationPage — Admin theme editor
// Change core 5 colors with live preview
// ============================================================================

import { useState } from 'react';
import { useTheme, DEFAULT_THEME } from '@presentation/shared/ThemeContext';
import { useToast } from '@presentation/shared/Toast';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ThemeCustomizationPage() {
  const { colors, setColors, resetToDefaults } = useTheme();
  const toast = useToast();

  const [formColors, setFormColors] = useState(colors);

  const handleColorChange = (key: keyof typeof formColors, value: string) => {
    const next = { ...formColors, [key]: value };
    setFormColors(next);
    // Apply live
    setColors(next);
  };

  const handleReset = () => {
    resetToDefaults();
    setFormColors(DEFAULT_THEME);
    toast.success('Theme reset to defaults');
  };

  const handleSave = () => {
    setColors(formColors);
    toast.success('Theme saved successfully');
  };

  const isDefault = JSON.stringify(formColors) === JSON.stringify(DEFAULT_THEME);

  const renderColorInput = (label: string, key: keyof typeof formColors, description: string) => (
    <div className="flex items-center gap-4 bg-surface rounded-xl border border-border p-4">
      <input
        type="color"
        value={formColors[key].startsWith('rgba') ? '#ffffff' : formColors[key]}
        onChange={(e) => handleColorChange(key, e.target.value)}
        className="h-12 w-12 rounded-lg border border-border cursor-pointer bg-transparent"
        disabled={formColors[key].startsWith('rgba')}
      />
      <div className="flex-1">
        <label className="block text-sm font-semibold text-text mb-1">{label}</label>
        <p className="text-xs text-text-muted mb-2">{description}</p>
        <input
          type="text"
          value={formColors[key]}
          onChange={(e) => handleColorChange(key, e.target.value)}
          className="w-full max-w-xs rounded-lg bg-background border border-border px-3 py-1.5 text-sm font-mono text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            Theme Customization
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage the core 5-color design system
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isDefault && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text hover:bg-surface transition-all"
            >
              Reset to Default
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            Save Theme
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Live Preview</p>
        </div>
        <div className="p-8" style={{ backgroundColor: formColors.background }}>
          <div className="max-w-md mx-auto rounded-xl border p-6" style={{ backgroundColor: formColors.surface, borderColor: formColors.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: formColors.primary, color: formColors.background }}
              >
                N
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: formColors.text }}>Nayantara <span style={{ color: formColors.primary }}>Rentals</span></p>
                <p className="text-[10px]" style={{ color: formColors.text, opacity: 0.7 }}>Premium Boutique</p>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-2" style={{ color: formColors.text }}>Luxury Collection</h2>
            <p className="text-sm mb-6" style={{ color: formColors.text, opacity: 0.7 }}>
              Discover our latest arrivals in premium dresses and jewellery.
            </p>

            <div className="flex gap-3">
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: formColors.primary, color: formColors.background }}
              >
                Browse Collection
              </button>
              <button
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
                style={{ borderColor: formColors.border, color: formColors.text }}
              >
                Track Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderColorInput('Background', 'background', 'Main page background color (e.g. #0F0F14)')}
        {renderColorInput('Surface', 'surface', 'Card and panel background color (e.g. #1A1A24)')}
        {renderColorInput('Primary', 'primary', 'Brand color for buttons and accents (e.g. #C8A96B)')}
        {renderColorInput('Text', 'text', 'Primary text color (e.g. #FFFFFF)')}
        {renderColorInput('Border', 'border', 'Border and divider color (e.g. rgba(200,169,107,0.15))')}
      </div>
    </div>
  );
}
