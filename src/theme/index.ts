export const colors = {
  ink: '#111722',
  night: '#192536',
  nightSoft: '#1F2D42',
  surface: '#151E2C',
  surfaceRaised: '#1C2839',
  line: '#2A3850',
  secondary: '#657080',
  text: '#E8E9E7',
  textDim: '#9AA3B2',
  gold: '#C4A66A',
  goldSoft: 'rgba(196,166,106,0.16)',
  alert: '#A94747',
  alertSoft: 'rgba(169,71,71,0.18)',
  success: '#648B72',
  successSoft: 'rgba(100,139,114,0.18)',
};

export const spacing = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const radius = { s: 6, m: 10, l: 14, xl: 20 } as const;

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, color: colors.text, letterSpacing: 1.5 },
  h2: { fontSize: 19, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textDim },
  mono: { fontSize: 12, color: colors.gold, fontVariant: ['tabular-nums' as const] },
};

export const touchTarget = { min: 44 };
