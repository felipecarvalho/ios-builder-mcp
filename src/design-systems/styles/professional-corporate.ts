import { DesignSystem } from '../../types/design.js';

export const professionalCorporate: DesignSystem = {
  id: 'professional-corporate',
  name: 'Professional Corporate',
  style: {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Trustworthy and polished with structured layouts and conservative colors',
    traits: ['professional', 'structured', 'trustworthy', 'polished', 'corporate'],
    mood: 'professional',
  },
  palette: {
    id: 'neutral-light-2',
    name: 'Corporate Blue',
    primary: '#1E40AF',
    accent: '#3B82F6',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
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
      largeTitle: 32,
      title1: 26,
      title2: 22,
      title3: 20,
      headline: 17,
      body: 16,
      callout: 15,
      subheadline: 14,
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
      name: 'Structured Grid',
      description: 'Consistent grid system with aligned content',
      implementation: 'Use 16pt grid, align content to 8pt increments',
    },
    {
      name: 'Data Visualization',
      description: 'Clear charts and graphs for business metrics',
      implementation: 'Use SF Symbols for icons, consistent color coding for data',
    },
    {
      name: 'Professional Transitions',
      description: 'Smooth, subtle transitions without playfulness',
      implementation: 'Use .easeInOut(duration: 0.2) for all transitions',
    },
  ],
  components: {
    cards: {
      cornerRadius: 8,
      padding: 16,
      shadow: {
        color: '#000000',
        radius: 4,
        x: 0,
        y: 2,
        opacity: 0.05,
      },
      border: {
        color: '#E5E7EB',
        width: 1,
      },
    },
    buttons: {
      cornerRadius: 8,
      padding: { horizontal: 20, vertical: 10 },
      fontWeight: 'semibold',
    },
    inputs: {
      cornerRadius: 8,
      padding: { horizontal: 12, vertical: 10 },
      borderWidth: 1,
    },
    navigation: {
      style: 'split',
      tabBarStyle: 'sidebarAdaptable',
    },
  },
};
