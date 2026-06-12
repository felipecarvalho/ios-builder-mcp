import { DesignSystem } from '../../types/design.js';

export const playfulGamified: DesignSystem = {
  id: 'playful-gamified',
  name: 'Playful Gamified',
  style: {
    id: 'playful-gamified',
    name: 'Playful Gamified',
    description: 'Energetic and fun with rounded shapes, vibrant colors, and game-like interactions',
    traits: ['playful', 'rounded', 'vibrant', 'energetic', 'gamified'],
    mood: 'playful',
  },
  palette: {
    id: 'vibrant-1',
    name: 'Candy Pop',
    primary: '#FF6B9D',
    accent: '#FFD93D',
    background: '#FFF5F7',
    surface: '#FFFFFF',
    textPrimary: '#2D1B3D',
    textSecondary: '#6B5B7B',
    success: '#4ECDC4',
    warning: '#FFA07A',
    error: '#FF6B6B',
  },
  typography: {
    fontFamily: 'SF Pro Rounded',
    headlineWeight: 'bold',
    bodyWeight: 'medium',
    scale: {
      largeTitle: 36,
      title1: 30,
      title2: 24,
      title3: 21,
      headline: 18,
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
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
  },
  signatureMoves: [
    {
      name: 'Bouncy Animations',
      description: 'Spring animations with overshoot for playful feel',
      implementation: 'Use .spring(response: 0.4, dampingFraction: 0.6) for interactions',
    },
    {
      name: 'Rounded Everything',
      description: 'Generous corner radius on all elements',
      implementation: 'Use 16-24pt corner radius on cards, 12-16pt on buttons',
    },
    {
      name: 'Progress Celebrations',
      description: 'Visual rewards for achievements and progress',
      implementation: 'Add confetti, sparkles, or scale animations on completion',
    },
  ],
  components: {
    cards: {
      cornerRadius: 20,
      padding: 20,
      shadow: {
        color: '#FF6B9D',
        radius: 12,
        x: 0,
        y: 6,
        opacity: 0.15,
      },
    },
    buttons: {
      cornerRadius: 16,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'bold',
    },
    inputs: {
      cornerRadius: 14,
      padding: { horizontal: 16, vertical: 14 },
      borderWidth: 2,
    },
    navigation: {
      style: 'tab',
      tabBarStyle: 'page',
    },
  },
};
