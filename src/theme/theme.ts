/**
 * Central design system. Dark, high-contrast, inspired by timeline planners
 * like Structured. Everything pulls from here so the look stays consistent.
 */

export const palette = {
  // task / event colors — keyed so they can be stored & restored
  coral: '#F18C82',
  orange: '#F2994A',
  yellow: '#F2C94C',
  green: '#6FCF7B',
  blue: '#56A4E8',
  teal: '#2D9C8F',
  red: '#EB5757',
  indigo: '#5B6CFF',
  white: '#E8E8EC',
} as const;

export type ColorKey = keyof typeof palette;

export const colorKeys = Object.keys(palette) as ColorKey[];

export const colors = {
  bg: '#0B0B0F',
  surface: '#16161C',
  surfaceElevated: '#1E1E26',
  surfacePressed: '#262630',
  border: '#262630',
  hairline: '#23232B',

  textPrimary: '#FFFFFF',
  textSecondary: '#9A9AA8',
  textTertiary: '#5E5E6B',

  accent: palette.coral,
  accentDim: 'rgba(241, 140, 130, 0.16)',

  tabActive: palette.coral,
  tabInactive: '#6B6B78',

  checkRing: '#3A3A46',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const font = {
  // System font keeps it native; weights tuned to match the reference shots
  black: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

/**
 * Central motion config. Kept calm and quick on purpose — short durations,
 * low-bounce springs, and capped list stagger so nothing feels jumpy or slow.
 */
export const motion = {
  fast: 140,
  base: 190,
  slow: 260,
  // crisp, almost no overshoot — for entrances
  springSoft: { damping: 22, stiffness: 220, mass: 0.7 },
  // snappy press feedback
  springPress: { damping: 26, stiffness: 420, mass: 0.6 },
  /** Capped per-item stagger so long lists still settle fast. */
  stagger(index: number, step = 26, cap = 6) {
    return Math.min(index, cap) * step;
  },
};

/** A slightly transparent tint of a task color, for soft backgrounds. */
export function tint(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
