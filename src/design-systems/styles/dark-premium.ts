import { DesignSystem } from '../../types/design.js';

export const darkPremium: DesignSystem = {
  id: 'dark-premium',
  name: 'Dark Premium',
  style: {
    id: 'dark-premium',
    name: 'Dark Premium',
    description: 'Luxurious and sophisticated with rich dark tones and metallic accents',
    traits: ['dark', 'premium', 'luxurious', 'sophisticated', 'metallic'],
    mood: 'dark',
  },
  palette: {
    id: 'neutral-dark-1',
    name: 'Midnight Gold',
    primary: '#D4AF37',
    accent: '#F4E5C2',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  typography: {
    fontFamily: 'SF Pro Display',
    headlineWeight: 'semibold',
    bodyWeight: 'regular',
    scale: {
      largeTitle: 34,
      title1: 28,
      title2: 22,
      title3: 20,
      headline: 17,
      body: 17,
      callout: 16,
      subheadline: 15,
      footnote: 13,
      caption1: 12,
      caption2: 11,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 1,
    },
  },
  spacing: {
    unit: 8,
    scale: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
  },
  signatureMoves: [
    {
      name: 'Metallic Gradients',
      description: 'Gold and silver gradients for premium feel',
      implementation: 'Use LinearGradient with gold (#D4AF37) to light gold (#F4E5C2)',
    },
    {
      name: 'Subtle Glow',
      description: 'Soft glow effects on interactive elements',
      implementation: 'Use shadow with accent color, 20pt radius, 0.3 opacity',
    },
    {
      name: 'Smooth Transitions',
      description: 'Elegant, slow transitions for luxury feel',
      implementation: 'Use .easeInOut(duration: 0.4) for all transitions',
    },
  ],
  components: {
    cards: {
      cornerRadius: 12,
      padding: 20,
      shadow: {
        color: '#D4AF37',
        radius: 20,
        x: 0,
        y: 8,
        opacity: 0.2,
      },
      border: {
        color: '#D4AF37',
        width: 1,
      },
    },
    buttons: {
      cornerRadius: 10,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'semibold',
    },
    inputs: {
      cornerRadius: 10,
      padding: { horizontal: 16, vertical: 12 },
      borderWidth: 1,
    },
    navigation: {
      style: 'stack',
      tabBarStyle: 'automatic',
    },
  },
};
