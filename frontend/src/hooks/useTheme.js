import { useEffect } from 'react';

/**
 * Apply theme colors globally as CSS custom properties
 * @param {Object} settings - Site settings object containing theme colors
 */
export function useTheme(settings) {
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Brand Colors
    if (settings.primary_color) {
      root.style.setProperty('--color-primary', settings.primary_color);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--color-secondary', settings.secondary_color);
    }

    // Text Colors
    if (settings.text_color) {
      root.style.setProperty('--color-text', settings.text_color);
    }
    if (settings.text_secondary_color) {
      root.style.setProperty('--color-text-secondary', settings.text_secondary_color);
    }

    // Button Colors
    if (settings.button_bg_color) {
      root.style.setProperty('--color-button-bg', settings.button_bg_color);
    }
    if (settings.button_text_color) {
      root.style.setProperty('--color-button-text', settings.button_text_color);
    }

    // Link Colors
    if (settings.link_color) {
      root.style.setProperty('--color-link', settings.link_color);
    }
    if (settings.link_hover_color) {
      root.style.setProperty('--color-link-hover', settings.link_hover_color);
    }

    // Status Colors
    if (settings.success_color) {
      root.style.setProperty('--color-success', settings.success_color);
    }
    if (settings.error_color) {
      root.style.setProperty('--color-error', settings.error_color);
    }
    if (settings.warning_color) {
      root.style.setProperty('--color-warning', settings.warning_color);
    }

    // UI Elements
    if (settings.border_color) {
      root.style.setProperty('--color-border', settings.border_color);
    }

    // Also set background color
    if (settings.secondary_color) {
      document.body.style.backgroundColor = settings.secondary_color;
    }
  }, [settings]);
}