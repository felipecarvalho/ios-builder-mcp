import { DesignSystem } from '../../types/design.js';

export const cleanMinimal: DesignSystem = {
  id: 'clean-minimal',
  name: 'Clean Minimal',
  style: {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Sophisticated simplicity with generous whitespace and refined typography',
    traits: ['minimal', 'clean', 'elegant', 'spacious', 'refined'],
    mood: 'clean',
  },
  palette: {
    id: 'neutral-light-1',
    name: 'Pure White',
    primary: '#000000',
    accent: '#007AFF',
    background: '#FFFFFF',
    surface: '#F5F5F7',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
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
      wide: 0.5,
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
      name: 'Generous Whitespace',
      description: 'Use ample spacing to create breathing room and visual hierarchy',
      implementation: 'Apply 24-32pt padding around content, 16-24pt between sections',
    },
    {
      name: 'Subtle Shadows',
      description: 'Soft, diffused shadows for depth without heaviness',
      implementation: 'Use shadow with 8-12pt radius, 0.08 opacity, 0 4pt offset',
    },
    {
      name: 'Refined Typography',
      description: 'Careful type scale with tight letter-spacing on headlines',
      implementation: 'Use -0.5pt letter-spacing on titles, regular on body',
    },
  ],
  components: {
    cards: {
      cornerRadius: 12,
      padding: 20,
      shadow: {
        color: '#000000',
        radius: 8,
        x: 0,
        y: 4,
        opacity: 0.08,
      },
    },
    buttons: {
      cornerRadius: 10,
      padding: { horizontal: 20, vertical: 12 },
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
