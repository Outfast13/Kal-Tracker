// Design tokens. The rules behind them live in docs/design/design-system.md; change that document first.

/** Premium dark design system for the Kal-Tracker dashboard. */
export const brand = { green: '#4AE2A5', teal: '#41D2E7', orange: '#FFB05C', charcoal: '#0B1320', mist: '#101B2B' } as const;

export const color = {
  ...brand,
  white: '#FFFFFF',
  text: '#EAF6FF',
  textMuted: '#8EA5B8',
  greenDeep: '#7DF4C7',
  tealDeep: '#85EAFB',
  danger: '#FF6B6B',
  frost: 'rgba(17, 28, 39, 0.82)',
  chrome: 'rgba(17, 29, 42, 0.96)',
  edge: 'rgba(133, 162, 190, 0.22)',
  track: 'rgba(158, 184, 205, 0.12)',
  field: 'rgba(14, 22, 35, 0.9)',
  switchOff: 'rgba(142, 165, 184, 0.28)',
  greenTint: 'rgba(74, 226, 165, 0.14)',
  dangerTint: 'rgba(255, 107, 107, 0.12)',
  scrim: 'rgba(4, 8, 14, 0.72)',
} as const;

export const radius = { card: 24, control: 14, pill: 999 } as const;
export const shadow = { card: '0 12 32 rgba(5,10,16,0.35)', chrome: '0 18 40 rgba(5,10,16,0.45)' } as const;

export const backdrop = {
  backgroundColor: brand.charcoal,
  experimental_backgroundImage:
    'radial-gradient(circle at 0% 0%, rgba(74,226,165,0.16) 0%, rgba(74,226,165,0) 65%), ' +
    'radial-gradient(circle at 100% 12%, rgba(65,210,231,0.15) 0%, rgba(65,210,231,0) 60%), ' +
    'radial-gradient(circle at 80% 100%, rgba(255,176,92,0.10) 0%, rgba(255,176,92,0) 50%)',
} as const;

const base = { color: color.text } as const;
export const type = {
  largeTitle: { ...base, fontSize: 34, fontWeight: '700', letterSpacing: 0.2 },
  title: { ...base, fontSize: 22, fontWeight: '700' },
  headline: { ...base, fontSize: 17, fontWeight: '600' },
  body: { ...base, fontSize: 16 },
  muted: { fontSize: 14, color: color.textMuted },
  caption: { fontSize: 12, fontWeight: '600', color: color.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
  link: { fontSize: 16, fontWeight: '600', color: color.greenDeep },
  error: { fontSize: 14, color: color.danger },
} as const;

export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
