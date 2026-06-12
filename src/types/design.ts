export interface DesignSystem {
  id: string;
  name: string;
  style: DesignStyle;
  palette: ColorPalette;
  typography: Typography;
  spacing: SpacingSystem;
  signatureMoves: SignatureMove[];
  components: ComponentPatterns;
}

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  traits: string[];
  reference?: string;
  mood: 'clean' | 'playful' | 'professional' | 'bold' | 'calm' | 'dark' | 'glassy' | 'retro';
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  surface?: string;
  textPrimary?: string;
  textSecondary?: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface Typography {
  fontFamily: string;
  headlineWeight: string;
  bodyWeight: string;
  scale: TypeScale;
  letterSpacing?: LetterSpacing;
}

export interface TypeScale {
  largeTitle: number;
  title1: number;
  title2: number;
  title3: number;
  headline: number;
  body: number;
  callout: number;
  subheadline: number;
  footnote: number;
  caption1: number;
  caption2: number;
}

export interface LetterSpacing {
  tight: number;
  normal: number;
  wide: number;
}

export interface SpacingSystem {
  unit: number;
  scale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export interface SignatureMove {
  name: string;
  description: string;
  implementation: string;
}

export interface ComponentPatterns {
  cards: CardPattern;
  buttons: ButtonPattern;
  inputs: InputPattern;
  navigation: NavigationPattern;
}

export interface CardPattern {
  cornerRadius: number;
  padding: number;
  shadow: ShadowConfig;
  border?: BorderConfig;
}

export interface ButtonPattern {
  cornerRadius: number;
  padding: { horizontal: number; vertical: number };
  fontWeight: string;
}

export interface InputPattern {
  cornerRadius: number;
  padding: { horizontal: number; vertical: number };
  borderWidth: number;
}

export interface NavigationPattern {
  style: 'stack' | 'split' | 'tab';
  tabBarStyle?: 'sidebarAdaptable' | 'page' | 'automatic';
}

export interface ShadowConfig {
  color: string;
  radius: number;
  x: number;
  y: number;
  opacity: number;
}

export interface BorderConfig {
  color: string;
  width: number;
}

export interface DesignSystemOption {
  reference: {
    id: string;
    name: string;
    domain?: string;
    styleId: string;
    traits: string[];
    rationale: string;
  };
  palette: {
    id: string;
    name: string;
    rationale: string;
    primary: string;
    accent: string;
    background: string;
    surface?: string;
    text?: string;
  };
}
