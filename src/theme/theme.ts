/**
 * Next Step - Playful, adult-oriented design system
 * Inspired by Duolingo + Finch: warm, friendly, rewarding
 */

export const colors = {
  // Primary - warm teal (Finch-like)
  primary: '#00B89F',
  primaryDark: '#009985',
  primaryLight: '#7EDDCE',

  // Accents
  accent: '#FF8C42',      // Warm coral for highlights
  accentSoft: '#FFE5D4',
  success: '#34C759',     // Fresh green for wins
  warning: '#FFB800',     // Sunny yellow
  destructive: '#E53935', // Red for destructive actions

  // Neutrals - warm undertones
  background: '#FDF8F5',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F3EF',
  border: '#E8E2DC',

  // Text
  text: '#2D2A26',
  textSecondary: '#6B6560',
  textMuted: '#9C9590',

  // Session (focused mode)
  sessionBg: '#1E3A3A',
  sessionSurface: '#2A4A4A',
  sessionAccent: '#7EDDCE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  full: 9999,
};

// Legacy exports
export const lightTheme = {
  background: colors.background,
  surface: colors.surface,
  text: colors.text,
  textSecondary: colors.textSecondary,
  accent: colors.primary,
  accentMuted: colors.primaryLight,
};
