import { Skill } from '../types/skills.js';

export const uiDesignSkill: Skill = {
  id: 'ui-design',
  name: 'UI Design Skill',
  description: 'Load when designing user interfaces, laying out screens, or styling components. Covers hierarchy, spacing, native iOS polish, and visual quality.',
  triggers: [
    'new screens',
    'layout work',
    'component styling',
    'visual direction',
    'UI design',
    'design system',
  ],
  type: 'bundled',
  content: `# UI Design Skill

When designing screens and components for iOS 26-targeting apps, follow system-native hierarchy first. Liquid Glass, motion, typography, spacing, and haptics should clarify the interface, not turn it into a novelty demo. Users should never need a manual to understand the app.

## 1. Primary and Secondary Actions

Every screen must have a clear visual hierarchy and an obvious next step.

- Primary actions: make the single most important action prominent, easy to tap, and paired with appropriate feedback.
- Secondary actions: keep alternatives visually subdued so they do not compete with the primary action.
- Visual focus: reduce competing noise with spacing, grouping, progressive disclosure, and calmer supporting chrome.

## 2. Brand Consistency

A cohesive brand builds trust. If styles drift between screens, the app feels unfinished.

- Use no more than three fonts across the app.
- Keep button treatment, colors, and language consistent from screen to screen.
- Design for the target demographic, not a generic template.
- Use Liquid Glass selectively for navigation chrome, floating utilities, and premium layers. Keep core content readable on stable backgrounds.
- Treat selected styles as seeds. If the project has a selected style such as clean, playful, glassy, or dark, preserve that mood while bending or blending it when the product's core action needs a better layout, interaction, or hierarchy.

## 2.5. Product-Specific Composition

Before implementing a major screen, choose 2-3 signature moves that belong to this app specifically:

- A distinctive first-screen composition that communicates the core loop without explanatory copy.
- A domain-specific status, progress, or result treatment rather than generic cards.
- A primary action placement and motion/feedback pattern that matches the user's motivation.

Avoid repeating the same large title, search bar, segmented control, and stacked rounded-card layout unless that is truly the best product shape.

## 3. Shareable Aha Moments

The core action screen should be understandable in a two-second screen recording.

- Make the app name or visual identity visible where it naturally belongs.
- Keep the main interaction visually simple enough to read at a glance.
- Give result, streak, match, completion, or generated-output moments a clear reward state with tasteful animation or haptics.

## 4. iOS 26 Product Rules

- Favor semantic typography, spacing, contrast, and native controls over ornamental custom chrome.
- Let navigation bars, tab bars, sheets, and controls feel native.
- Treat accessibility as polish: dynamic type, contrast, hit targets, and reduced motion should work by default.
- Avoid dark patterns, fake disabled states, or confusing hierarchy.

## 5. Component Patterns

### Cards
- Use consistent corner radius (12-16pt for most apps)
- Apply subtle shadows for depth (radius: 8-12pt, opacity: 0.08-0.12)
- Maintain consistent padding (16-24pt)
- Consider borders for definition in light themes

### Buttons
- Primary: filled with accent color, semibold weight
- Secondary: outlined or subtle background
- Tertiary: text-only with accent color
- Minimum tap target: 44x44pt
- Padding: 12-16pt vertical, 20-24pt horizontal

### Inputs
- Corner radius: 10-12pt
- Padding: 12-14pt vertical, 16pt horizontal
- Border: 1pt with secondary text color at 0.2 opacity
- Focus state: accent color border, subtle shadow

### Navigation
- Use NavigationStack for hierarchical flows
- Use TabView with .sidebarAdaptable for top-level sections
- Toolbar: compact, icon-only on iPhone, can include labels on iPad
- Back button: let system handle, don't customize unless necessary

## 6. Typography Hierarchy

Follow iOS type scale:
- Large Title: 34pt, semibold (screen titles)
- Title 1: 28pt, semibold (section headers)
- Title 2: 22pt, semibold (subsection headers)
- Title 3: 20pt, semibold (card titles)
- Headline: 17pt, semibold (emphasis)
- Body: 17pt, regular (primary content)
- Callout: 16pt, regular (secondary content)
- Subheadline: 15pt, regular (labels)
- Footnote: 13pt, regular (metadata)
- Caption: 12pt, regular (small details)

## 7. Color Usage

- Primary: main brand color, used for primary actions
- Accent: secondary brand color, used for highlights
- Background: app background color
- Surface: card/panel background
- Text Primary: main text color
- Text Secondary: secondary text color (60% opacity)
- Success/Warning/Error: semantic colors for feedback

## 8. Spacing System

Use 8pt grid:
- xs: 4pt (tight spacing)
- sm: 8pt (related elements)
- md: 16pt (standard spacing)
- lg: 24pt (section spacing)
- xl: 32pt (major sections)
- xxl: 48pt (screen padding)

## 9. Animation Guidelines

- Use spring animations for interactive elements: .spring(response: 0.3, dampingFraction: 0.7)
- Use ease animations for transitions: .easeInOut(duration: 0.2)
- Matched geometry for element transitions
- Haptic feedback for important interactions
- Respect reduce motion accessibility setting

## 10. Accessibility

- Support Dynamic Type (use semantic font styles)
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text
- Minimum tap target: 44x44pt
- Provide labels for all interactive elements
- Support VoiceOver with proper accessibility modifiers
- Test with increased text sizes (200%)
`,
};
