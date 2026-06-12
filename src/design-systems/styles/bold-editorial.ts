import { DesignSystem } from '../../types/design.js';

export const boldEditorial: DesignSystem = {
  id: 'bold-editorial',
  name: 'Bold Editorial',
  style: {
    id: 'bold-editorial',
    name: 'Bold Editorial',
    description: 'High-contrast typography and dramatic layouts inspired by magazines',
    traits: ['bold', 'editorial', 'dramatic', 'high-contrast', 'typographic'],
    mood: 'bold',
  },
  palette: {
    id: 'monochrome-1',
    name: 'Black & White',
    primary: '#000000',
    accent: '#FF0000',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    textPrimary: '#000000',
    textSecondary: '#666666',
    success: '#00C853',
    warning: '#FFAB00',
    error: '#D50000',
  },
  typography: {
    fontFamily: 'New York',
    headlineWeight: 'black',
    bodyWeight: 'regular',
    scale: {
      largeTitle: 40,
      title1: 32,
      title2: 26,
      title3: 22,
      headline: 19,
      body: 17,
      callout: 16,
      subheadline: 15,
      footnote: 13,
      caption1: 12,
      caption2: 11,
    },
    letterSpacing: {
      tight: -1,
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
      lg: 32,
      xl: 48,
      xxl: 64,
    },
  },
  signatureMoves: [
    {
      name: 'Oversized Headlines',
      description: 'Large, bold typography as the primary visual element',
      implementation: 'Use 40-48pt headlines with tight letter-spacing (-1pt)',
    },
    {
      name: 'High Contrast',
      description: 'Stark black and white with strategic accent color',
      implementation: 'Use pure black text on white, red accent sparingly',
    },
    {
      name: 'Editorial Grid',
      description: 'Asymmetric layouts with strong vertical rhythm',
      implementation: 'Use 32pt margins, vary column widths for visual interest',
    },
  ],
  components: {
    cards: {
      cornerRadius: 0,
      padding: 24,
      shadow: {
        color: '#000000',
        radius: 0,
        x: 0,
        y: 0,
        opacity: 0,
      },
      border: {
        color: '#000000',
        width: 2,
      },
    },
    buttons: {
      cornerRadius: 0,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'black',
    },
    inputs: {
      cornerRadius: 0,
      padding: { horizontal: 16, vertical: 12 },
      borderWidth: 2,
    },
    navigation: {
      style: 'stack',
      tabBarStyle: 'automatic',
    },
  },
};
