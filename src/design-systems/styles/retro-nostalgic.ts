import { DesignSystem } from '../../types/design.js';

export const retroNostalgic: DesignSystem = {
  id: 'retro-nostalgic',
  name: 'Retro Nostalgic',
  style: {
    id: 'retro-nostalgic',
    name: 'Retro Nostalgic',
    description: 'Vintage-inspired with warm colors, textured elements, and nostalgic feel',
    traits: ['retro', 'nostalgic', 'warm', 'textured', 'vintage'],
    mood: 'retro',
  },
  palette: {
    id: 'vibrant-3',
    name: 'Sunset Retro',
    primary: '#FF6B6B',
    accent: '#FFE66D',
    background: '#FFF9E6',
    surface: '#FFFFFF',
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    success: '#55E6C1',
    warning: '#FFA502',
    error: '#FF4757',
  },
  typography: {
    fontFamily: 'SF Pro Display',
    headlineWeight: 'bold',
    bodyWeight: 'regular',
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
      name: 'Warm Gradients',
      description: 'Sunset-inspired gradients for nostalgic feel',
      implementation: 'Use LinearGradient with warm colors (red, orange, yellow)',
    },
    {
      name: 'Rounded Retro',
      description: 'Rounded corners with slight vintage feel',
      implementation: 'Use 16-20pt corner radius, add subtle border',
    },
    {
      name: 'Playful Icons',
      description: 'SF Symbols with retro color treatment',
      implementation: 'Use gradient fills on SF Symbols, add slight rotation',
    },
  ],
  components: {
    cards: {
      cornerRadius: 18,
      padding: 20,
      shadow: {
        color: '#FF6B6B',
        radius: 12,
        x: 0,
        y: 6,
        opacity: 0.15,
      },
      border: {
        color: '#FF6B6B',
        width: 2,
      },
    },
    buttons: {
      cornerRadius: 14,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'bold',
    },
    inputs: {
      cornerRadius: 14,
      padding: { horizontal: 16, vertical: 12 },
      borderWidth: 2,
    },
    navigation: {
      style: 'tab',
      tabBarStyle: 'page',
    },
  },
};
