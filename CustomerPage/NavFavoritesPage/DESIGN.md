---
name: Katipuneros Library Store
colors:
  surface: '#f4fbfc'
  surface-dim: '#d4dbdc'
  surface-bright: '#f4fbfc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f6'
  surface-container: '#e8eff0'
  surface-container-high: '#e2e9ea'
  surface-container-highest: '#dde4e5'
  on-surface: '#161d1e'
  on-surface-variant: '#40484e'
  inverse-surface: '#2b3233'
  inverse-on-surface: '#ebf2f3'
  outline: '#70787f'
  outline-variant: '#bfc8cf'
  surface-tint: '#00658b'
  primary: '#00658a'
  on-primary: '#ffffff'
  primary-container: '#287ea7'
  on-primary-container: '#ffffff'
  inverse-primary: '#84cffc'
  secondary: '#31647a'
  on-secondary: '#ffffff'
  secondary-container: '#b2e4fe'
  on-secondary-container: '#34677d'
  tertiary: '#006681'
  on-tertiary: '#ffffff'
  tertiary-container: '#26809d'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5e7ff'
  primary-fixed-dim: '#84cffc'
  on-primary-fixed: '#001e2d'
  on-primary-fixed-variant: '#004c6a'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#9ccee6'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#144c61'
  tertiary-fixed: '#baeaff'
  tertiary-fixed-dim: '#82d1f1'
  on-tertiary-fixed: '#001f29'
  on-tertiary-fixed-variant: '#004d62'
  background: '#f4fbfc'
  on-background: '#161d1e'
  surface-variant: '#dde4e5'
  soft-blue: '#D9EEF5'
  glass-surface: rgba(255,255,255,0.55)
  action-green: '#9BE564'
  action-green-hover: '#82D64C'
  text-primary: '#18323D'
  text-secondary: '#647982'
  status-available: '#7FA58D'
  status-pending: '#D9A85C'
  status-danger: '#B96F72'
  chip-unselected-bg: rgba(255,255,255,0.70)
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  headline-1:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-2:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-3:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-4:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.35'
  body-large:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  small:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 24px
  margin: 32px
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
  space-2xl: 48px
  space-3xl: 64px
---

## Brand & Style

This design system establishes a dual-identity ecosystem: an immersive, discovery-driven public storefront and a structured, high-density administrative workspace. The brand personality is academic, professional, calm, friendly, trustworthy, and modern—bridging the emotional warmth of a university library with the seamless experience of a contemporary digital bookstore. 

The UI evokes clarity, intellectual curiosity, and reliability. It avoids stark corporate coldness and chaotic novelty, favoring a tranquil academic palette punctuated by intentional, high-contrast interactive cues.

The aesthetic fuses **Modern Minimalism** with subtle **Glassmorphism**, employing translucent frosted surfaces, high-end layering, and crisp typographic hierarchy over a tranquil soft-blue canvas.

## Colors

The color architecture is built on a precise functional hierarchy. The palette leverages a calming backdrop of Soft Blue and Main Background tones, allowing Deep Blue text and Primary Blue interactive anchors to command immediate visual clarity. 

Color application follows strict operational constraints:
- **Action Green (`#9BE564`)** is strictly reserved for primary calls-to-action (Sign Up, Reserve Book, Confirm) and positive state validations. It must never be used for arbitrary decoration.
- **Glass Surfaces (`rgba(255,255,255,0.55)`)** provide depth for floating navigation, hero cards, and search controls over background visual elements.
- **Status Indicators** communicate operational states instantly through dedicated tokens: Available (`#7FA58D`), Pending (`#D9A85C`), and Danger/Overdue (`#B96F72`).

## Typography

The typographic system utilizes a clean, neutral sans-serif foundation designed for high-density reading and rapid data scanning. Scale ratios are tightly controlled to establish an authoritative yet welcoming academic tone.

- **Headlines** utilize bold weights (`600`–`700`) with proportional tightening of letter spacing to maintain impact at larger sizes.
- **Body copy** is optimized at 16px with a `1.5` line height for extended reading comfort across catalog descriptions and policy pages.
- **Metadata and UI labels** scale down cleanly to 14px and 12px, maintaining legibility even within dense administrative tables and inventory lists.

## Layout & Spacing

The layout philosophy relies on a **fluid grid system** anchored to an 8px base unit. Content containers scale fluidly across viewports while respecting maximum readability widths.

- **Breakpoints & Adaptation:**
  - *Desktop (1024px+):* Supports 3–4 product cards per row, dedicated management sidebars, and wide multi-column analytics layouts.
  - *Tablet (768px – 1023px):* Adapts to 2–3 cards per row, condensed navigation bars, and scrollable data tables.
  - *Mobile (< 768px):* Transitions to single-column stacking, horizontal category scrolling, horizontal book carousels, and fixed floating bottom navigation.
- **Spacing Rhythm:** Generous section spacing (`48px`–`64px`) prevents visual fatigue on public discovery views, whereas compact component spacing (`8px`–`16px`) optimizes data density within administrative forms and tables.

## Elevation & Depth

Depth is established through a combination of tonal layering, glassmorphism, and atmospheric environmental shadows. Rather than relying on stark black drop shadows, elevation communicates hierarchy through translucent light diffusion.

- **Glass Surfaces:** Implements `backdrop-filter: blur(18px)` paired with semi-transparent white fills (`rgba(255,255,255,0.55)`) and subtle structural borders (`1px solid rgba(255,255,255,0.65)`) to lift floating navigation, search controls, and reservation panels above the soft blue canvas.
- **Layering Rules:** Fixed navigation and modal overlays utilize deliberate z-index stacking. Interactive cards feature soft, diffused elevation shifts on hover to invite engagement without visual clutter.

## Shapes

The shape language reflects a **Rounded (Level 2)** philosophy, utilizing generous curves to foster an approachable, welcoming digital environment while maintaining structural precision.

- **Buttons & Controls:** Standard buttons feature `10–14px` border radii.
- **Inputs & Search:** Standard forms use `12–16px`, while search bars and category chips adopt fully pill-shaped radii (`999px`) for a modern, touch-friendly aesthetic.
- **Cards & Panels:** Standard product cards utilize `18–24px` radii, scaling up to `28–36px` for large visual hero panels and modal containers.

## Components

All components must adhere strictly to the token values defined in previous sections, ensuring unified brand execution across public discovery and administrative operations.

- **Buttons:** Primary interactive triggers utilize **Action Green (`#9BE564`)** with high-contrast primary text (`#18323D`) and a hover state of `#82D64C`. Secondary actions leverage ghost or Soft Blue backgrounds with Primary Blue text. All touch targets must maintain a minimum height of `44px`.
- **Chips:** Category filters and tags use pill-shaped containers (`999px`). Unselected chips render with a translucent background (`rgba(255,255,255,0.70)`) and secondary text, transitioning smoothly to Primary Blue or Action Green upon selection.
- **Input Fields:** Form inputs feature generous padding, `12–16px` border radii, and a subtle Primary Blue focus ring. Search inputs adopt a pill-shaped layout with integrated icon placement.
- **Cards:** Product and book cards utilize Soft Blue or Glass surfaces, structured with `18–24px` corner radii and subtle hover elevation lifts. Metadata overlays must maintain WCAG-compliant contrast against background imagery.
- **Checkboxes & Radios:** Built with crisp borders matching Primary Blue when active, incorporating smooth `150ms` transition states for feedback confirmation.
- **Lists & Data Tables:** Administrative tables employ clean horizontal separators, alternating row highlights, and dedicated status badges (Available, Pending, Overdue) using the designated feedback color tokens.