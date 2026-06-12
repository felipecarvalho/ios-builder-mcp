import { DesignSystem } from '../../types/design.js';

export const calmWellness: DesignSystem = {
  id: 'calm-wellness',
  name: 'Calm Wellness',
  style: {
    id: 'calm-wellness',
    name: 'Calm Wellness',
    description: 'Soothing and serene with soft colors, gentle curves, and mindful spacing',
    traits: ['calm', 'serene', 'soft', 'mindful', 'wellness'],
    mood: 'calm',
  },
  palette: {
    id: 'neutral-light-3',
    name: 'Sage Garden',
    primary: '#5B8C7F',
    accent: '#A8C99B',
    background: '#F8F9F7',
    surface: '#FFFFFF',
    textPrimary: '#2C3E3D',
    textSecondary: '#7A8B89',
    success: '#81B29A',
    warning: '#F2CC8F',
    error: '#E07A5F',
  },
  typography: {
    fontFamily: 'SF Pro Display',
    headlineWeight: 'medium',
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
  },
  spacing: {
    unit: 8,
    scale: {
      xs: 4,
      sm: 8,
      md: 20,
      lg: 32,
      xl: 48,
      xxl: 64,
    },
  },
  signatureMoves: [
    {
      name: 'Breathing Animations',
      description: 'Slow, rhythmic animations that encourage calm',
      implementation: 'Use .easeInOut(duration: 0.8) for gentle transitions',
    },
    {
      name: 'Soft Gradients',
      description: 'Subtle gradients that evoke natural environments',
      implementation: 'Use LinearGradient with 2-3 analogous colors, 0.3 opacity',
    },
    {
      name: 'Mindful Progress',
      description: 'Non-urgent progress indicators without pressure',
      implementation: 'Use circular progress with soft colors, no countdown timers',
    },
  ],
  components: {
    cards: {
      cornerRadius: 16,
      padding: 24,
      shadow: {
        color: '#5B8C7F',
        radius: 16,
        x: 0,
        y: 8,
        opacity: 0.1,
      },
    },
    buttons: {
      cornerRadius: 12,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'medium',
    },
    inputs: {
      cornerRadius: 12,
      padding: { horizontal: 16, vertical: 14 },
      borderWidth: 1,
    },
    navigation: {
      style: 'stack',
      tabBarStyle: 'automatic',
    },
  },
};
