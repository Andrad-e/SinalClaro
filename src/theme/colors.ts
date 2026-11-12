/**
 * Paleta do Sinal.claro — pensada para alto contraste (WCAG 2.2 AA, RNF-004)
 * e para comunicar clareza/sinal: azul profundo (confiança institucional)
 * + ciano (sinal, acessibilidade) + âmbar (acento humano, calor).
 */
export const colors = {
  background: '#060B18',
  backgroundAlt: '#0B1330',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceBorder: 'rgba(255, 255, 255, 0.12)',

  primary: '#2F6BFF',
  primaryLight: '#5B8CFF',
  accent: '#22D3EE',
  accentSoft: '#67E8F9',
  warn: '#FBBF24',

  textPrimary: '#F8FAFC',
  textSecondary: 'rgba(248, 250, 252, 0.68)',
  textMuted: 'rgba(248, 250, 252, 0.45)',

  success: '#34D399',
  danger: '#FB7185',

  gradientFrom: '#0B1330',
  gradientVia: '#101B45',
  gradientTo: '#06142E',
} as const;

export type ColorToken = keyof typeof colors;
