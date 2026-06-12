import { DesignSystem } from '../../types/design.js';

export const glassyModern: DesignSystem = {
  id: 'glassy-modern',
  name: 'Glassy Modern',
  style: {
    id: 'glassy-modern',
    name: 'Glassy Modern',
    description: 'Contemporary iOS 26 aesthetic with Liquid Glass materials and depth',
    traits: ['glassy', 'modern', 'liquid', 'depth', 'translucent'],
    mood: 'glassy',
  },
  palette: {
    id: 'vibrant-2',
    name: 'Aurora',
    primary: '#6366F1',
    accent: '#8B5CF6',
    background: '#F5F3FF',
    surface: '#FFFFFF',
    textPrimary: '#1E1B4B',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
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
      name: 'Liquid Glass Materials',
      description: 'Use .ultraThinMaterial and .regularMaterial for depth',
      implementation: 'Apply .background(.ultraThinMaterial) to floating elements',
    },
    {
      name: 'Layered Depth',
      description: 'Multiple layers with varying blur and opacity',
      implementation: 'Stack materials: .ultraThinMaterial > .regularMaterial > .thickMaterial',
    },
    {
      name: 'Smooth Morphing',
      description: 'Matched geometry effects for seamless transitions',
      implementation: 'Use .matchedGeometryEffect for element transitions',
    },
  ],
  components: {
    cards: {
      cornerRadius: 16,
      padding: 20,
      shadow: {
        color: '#6366F1',
        radius: 24,
        x: 0,
        y: 12,
        opacity: 0.15,
      },
    },
    buttons: {
      cornerRadius: 12,
      padding: { horizontal: 24, vertical: 14 },
      fontWeight: 'semibold',
    },
    inputs: {
      cornerRadius: 12,
      padding: { horizontal: 16, vertical: 12 },
      borderWidth: 0,
    },
    navigation: {
      style: 'stack',
      tabBarStyle: 'sidebarAdaptable',
    },
  },
};
