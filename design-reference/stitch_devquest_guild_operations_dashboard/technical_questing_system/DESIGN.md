---
name: Technical Questing System
colors:
  surface: "#10131a"
  surface-dim: "#10131a"
  surface-bright: "#363941"
  surface-container-lowest: "#0b0e15"
  surface-container-low: "#191b23"
  surface-container: "#1d2027"
  surface-container-high: "#272a31"
  surface-container-highest: "#32353c"
  on-surface: "#e1e2ec"
  on-surface-variant: "#c2c6d6"
  inverse-surface: "#e1e2ec"
  inverse-on-surface: "#2e3038"
  outline: "#8c909f"
  outline-variant: "#424754"
  surface-tint: "#adc6ff"
  primary: "#adc6ff"
  on-primary: "#002e6a"
  primary-container: "#4d8eff"
  on-primary-container: "#00285d"
  inverse-primary: "#005ac2"
  secondary: "#d0bcff"
  on-secondary: "#3c0091"
  secondary-container: "#571bc1"
  on-secondary-container: "#c4abff"
  tertiary: "#ffb786"
  on-tertiary: "#502400"
  tertiary-container: "#df7412"
  on-tertiary-container: "#461f00"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#d8e2ff"
  primary-fixed-dim: "#adc6ff"
  on-primary-fixed: "#001a42"
  on-primary-fixed-variant: "#004395"
  secondary-fixed: "#e9ddff"
  secondary-fixed-dim: "#d0bcff"
  on-secondary-fixed: "#23005c"
  on-secondary-fixed-variant: "#5516be"
  tertiary-fixed: "#ffdcc6"
  tertiary-fixed-dim: "#ffb786"
  on-tertiary-fixed: "#311400"
  on-tertiary-fixed-variant: "#723600"
  background: "#10131a"
  on-background: "#e1e2ec"
  surface-variant: "#32353c"
typography:
  chapter-header:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "600"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  chapter-header-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-label:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system establishes a high-performance, technical environment that bridges the gap between a professional IDE and a strategic simulation. The brand personality is disciplined, elite, and focused, catering to developers and project managers who treat their career growth as a structured campaign.

The visual style is **Corporate Modern with a "Technical Immersion" edge**. It draws heavily from the minimalist, high-productivity interfaces of modern SaaS tools (Vercel, Linear) while integrating subtle gamified elements that signify progress and "Project Health" without veering into traditional gaming tropes. The atmosphere is quiet and premium, using deep navies and slates to reduce cognitive load, allowing the vibrant functional accents to guide the user's attention to critical tasks and achievements.

## Colors

The palette is anchored in a "Deep Space" hierarchy. The primary background uses a near-black navy to provide a sense of infinite depth, while surfaces scale upward in lightness to indicate interactive priority.

- **Primary & Secondary:** Cool Blue is used for primary actions and system-level interactions. Subtle Violet is reserved for "Quest" milestones, XP gain, and progression-related elements.
- **Project Health States:** These colors are used for "Health" meters and status indicators. Emerald represents optimal health/completion, Amber signifies technical debt or slowing velocity, and Muted Red indicates critical blockers or project failure risks.
- **Accents:** Use accents sparingly to maintain the professional aesthetic. Color should always follow function.

## Typography

The typography system utilizes a dual-font approach to balance technical precision with campaign storytelling.

- **Space Grotesk:** Used exclusively for Chapter Headers and major milestone titles. Its geometric, slightly futuristic structure provides the "RPG" flair while remaining clean and modern.
- **Geist:** The workhorse font for all functional UI, body text, and data points. It provides a developer-centric feel that is highly legible in dark mode.
- **Hierarchy:** Use `label-caps` for metadata like "LVL 14" or "PROJECT ID". Use `mono-label` for technical specs, commit hashes, or XP values to reinforce the developer-centric nature of the platform.

## Layout & Spacing

This design system uses a **Fluid-Fixed Hybrid Grid**. The content is contained within a max-width of 1280px for standard views, ensuring optimal line lengths for reading technical documentation and logs.

- **Rhythm:** A 4px baseline grid ensures consistent vertical rhythm. Standard padding for cards and sections is 24px (`lg`).
- **Layout Model:** Dashboard views should utilize a "Sidebar + Main Stage" layout. The Sidebar (280px) handles navigation and user profile stats, while the Main Stage handles the active simulation or task list.
- **Responsive Behavior:** On mobile, margins reduce to 16px. Complex data tables should collapse into "Quest Cards," and navigation moves to a bottom-fixed bar or a simplified hamburger menu to maintain the focus on the current objective.

## Elevation & Depth

Hierarchy is established through **Tonal Layering and Subtle Outlines** rather than heavy shadows.

- **Layer 0 (Base):** `#0B0F19` — The infinite background.
- **Layer 1 (Surfaces):** `#161B22` — Navigation bars, sidebars, and inactive card states.
- **Layer 2 (Elevated):** `#21262D` — Active cards, modals, and tooltips.
- **Borders:** Every interactive container must have a 1px border using `#1E293B`. This defines the edges clearly in a low-light environment.
- **Interaction:** On hover, borders should transition to `primary_color` at 50% opacity. This "glow" effect subtly cues the RPG progression theme without breaking the professional aesthetic.

## Shapes

The shape language is **Refined and Structured**.

- **Standard Elements:** Buttons, inputs, and small cards use `rounded-md` (8px).
- **Major Containers:** Project dashboards and large quest modules use `rounded-xl` (16px) to create a softer, more premium "app" feel.
- **Progress Bars:** These should be semi-rounded (4px) to look like high-precision instruments rather than toys.
- **Visual Style:** Use sharp lines for technical data and rounded corners for the containers holding that data. This creates a balanced "Technical vs. Approachable" tension.

## Components

### Buttons & Inputs

- **Primary Action:** Solid `#3B82F6` with white text. No gradients.
- **Ghost Action:** Transparent background with `#1E293B` border. On hover, background becomes `#21262D`.
- **Inputs:** Darker background than their parent container, with a subtle 1px border. Focus state uses a 1px Blue glow.

### Progression Elements

- **XP Progress Bars:** A slim (8px height) track using `#1E293B` as the background. The "filled" state uses a horizontal gradient from `#3B82F6` to `#8B5CF6`.
- **Project Health Indicator:** A segmented bar (5 segments). Color-coded based on the "Status" tokens. A healthy project has 5 Emerald segments; a critical project has 1 Red segment pulsing at 20% opacity.
- **Quest Cards:** Feature a `mono-label` in the top right for "Difficulty Rating" (e.g., Lvl. 5) and a progress indicator at the bottom edge.

### Navigation & Headers

- **Campaign Chapter Headers:** Large `chapter-header` text with a subtle horizontal line trailing after the text to indicate a "timeline" or "path."
- **Sidebars:** Use consistent 24px padding. Active links feature a solid 2px blue vertical line on the left edge.
