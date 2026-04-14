/**
 * Pax Mentis — Material 3 Expressive color system
 *
 * Seed colour: Sage Green #4A7A4A
 * Secondary:   Dusty Lavender #7B6BB0
 * Tertiary:    Warm Amber     #8A6A00
 *
 * All roles follow M3 tonal palette generation.
 * Legacy tokens (card, muted, sage, …) are kept as aliases for
 * backward-compatibility with existing components.
 */

// ─── M3 Spring-physics motion presets ─────────────────────────────────────
// Pass these as the second argument to Reanimated's withSpring().
export const M3Spring = {
  /** Standard spatial transition — element enters/exits the screen */
  spatialDefault: { stiffness: 380, damping: 30, mass: 1 },
  /** Quick snap — toggle state feedback, small position shifts */
  spatialFast:    { stiffness: 600, damping: 36, mass: 1 },
  /** Deliberate entry — sheets, large panels */
  spatialSlow:    { stiffness: 260, damping: 24, mass: 1 },
  /** Colour / opacity cross-fade */
  effectDefault:  { stiffness: 380, damping: 30, mass: 1 },
  /** Rapid state color change */
  effectFast:     { stiffness: 600, damping: 36, mass: 1 },
} as const;

// ─── Light theme ───────────────────────────────────────────────────────────
const light = {
  // Primary — Sage Green
  primary:              "#3B6E3B",
  onPrimary:            "#FFFFFF",
  primaryContainer:     "#B8DCBA",
  onPrimaryContainer:   "#002106",

  // Secondary — Neutral Green
  secondary:            "#52634F",
  onSecondary:          "#FFFFFF",
  secondaryContainer:   "#D5E8D0",
  onSecondaryContainer: "#101F0E",

  // Tertiary — Warm Amber (grounding / warmth)
  tertiary:             "#7B5E00",
  onTertiary:           "#FFFFFF",
  tertiaryContainer:    "#FFDF96",
  onTertiaryContainer:  "#261900",

  // Error
  error:                "#BA1A1A",
  onError:              "#FFFFFF",
  errorContainer:       "#FFDAD6",
  onErrorContainer:     "#410002",

  // Surface tones
  surface:              "#F6FAF2",
  onSurface:            "#181D17",
  surfaceVariant:       "#DDE5D9",
  onSurfaceVariant:     "#414E3E",
  surfaceContainer:     "#EBF0E8",
  surfaceContainerHigh: "#E5EAE2",
  inverseSurface:       "#2D3229",
  inverseOnSurface:     "#EEF3EA",
  inversePrimary:       "#8FCF91",

  // Outline
  outline:        "#717E6D",
  outlineVariant: "#C0C9BB",

  // Misc
  shadow: "#000000",
  scrim:  "#000000",

  // ── Legacy / backward-compat aliases ──────────────────────────────────
  text:               "#181D17",
  tint:               "#3B6E3B",
  background:         "#F6FAF2",
  foreground:         "#181D17",
  card:               "#EBF0E8",
  cardForeground:     "#181D17",
  muted:              "#DDE5D9",
  mutedForeground:    "#5C6A58",
  accent:             "#7B6BB0",
  accentForeground:   "#FFFFFF",
  destructive:        "#BA1A1A",
  destructiveForeground: "#FFFFFF",
  border:             "#C0C9BB",
  input:              "#C0C9BB",

  // Semantic palette
  sage:      "#3B6E3B",
  sageLight: "#8FCF91",
  sageDark:  "#1A5223",
  sand:      "#C2A86B",
  sandLight: "#FFDF96",
  pearl:     "#F6FAF2",
  forest:    "#181D17",
  moss:      "#52634F",
  cream:     "#FAFDF7",
  warmGray:  "#5C6A58",
  highlight: "#B8DCBA",

  // Lavender accent (Wiki / secondary UI)
  lavender:      "#7B6BB0",
  lavenderLight: "#C8BFEA",
  lavenderDark:  "#4A3B80",
};

// ─── Dark theme ────────────────────────────────────────────────────────────
const dark = {
  // Primary
  primary:              "#8FCF91",
  onPrimary:            "#003A11",
  primaryContainer:     "#1A5223",
  onPrimaryContainer:   "#B8DCBA",

  // Secondary
  secondary:            "#B9CCB3",
  onSecondary:          "#253523",
  secondaryContainer:   "#3B4B38",
  onSecondaryContainer: "#D5E8D0",

  // Tertiary
  tertiary:             "#F0BF45",
  onTertiary:           "#3F2E00",
  tertiaryContainer:    "#5B4400",
  onTertiaryContainer:  "#FFDF96",

  // Error
  error:                "#FFB4AB",
  onError:              "#690005",
  errorContainer:       "#93000A",
  onErrorContainer:     "#FFDAD6",

  // Surface tones
  surface:              "#101410",
  onSurface:            "#E1E5DC",
  surfaceVariant:       "#414E3E",
  onSurfaceVariant:     "#C0C9BB",
  surfaceContainer:     "#1B2019",
  surfaceContainerHigh: "#262B24",
  inverseSurface:       "#E1E5DC",
  inverseOnSurface:     "#2D3229",
  inversePrimary:       "#3B6E3B",

  // Outline
  outline:        "#8A9286",
  outlineVariant: "#414E3E",

  // Misc
  shadow: "#000000",
  scrim:  "#000000",

  // ── Legacy / backward-compat aliases ──────────────────────────────────
  text:               "#E1E5DC",
  tint:               "#8FCF91",
  background:         "#101410",
  foreground:         "#E1E5DC",
  card:               "#1B2019",
  cardForeground:     "#E1E5DC",
  muted:              "#262B24",
  mutedForeground:    "#8FA48A",
  accent:             "#A99BD4",
  accentForeground:   "#0A0020",
  destructive:        "#FFB4AB",
  destructiveForeground: "#690005",
  border:             "#414E3E",
  input:              "#414E3E",

  // Semantic palette
  sage:      "#8FCF91",
  sageLight: "#B8DCBA",
  sageDark:  "#3B6E3B",
  sand:      "#F0BF45",
  sandLight: "#5B4400",
  pearl:     "#1B2019",
  forest:    "#E1E5DC",
  moss:      "#B9CCB3",
  cream:     "#101410",
  warmGray:  "#8A9286",
  highlight: "#1A5223",

  // Lavender accent
  lavender:      "#A99BD4",
  lavenderLight: "#4A3B80",
  lavenderDark:  "#C8BFEA",
};

const colors = {
  light,
  dark,
  /** M3 corner radius scale */
  radius: 16,
  /** Shape tokens */
  shape: {
    none:       0,
    extraSmall: 4,
    small:      8,
    medium:     12,
    large:      16,
    extraLarge: 28,
    full:       9999,
  },
};

export default colors;
