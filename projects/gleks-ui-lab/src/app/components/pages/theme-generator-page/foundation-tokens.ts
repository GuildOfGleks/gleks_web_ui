// The foundation layer's real, individually-declared token names (see theme.css's own
// `:root` block) — deliberately hand-picked rather than regex-extracted like
// `generator-catalog.ts` does for component tokens, because `theming-page`'s
// `TOKEN_SECTIONS` compresses several of these into one documentation row (e.g.
// `--gog-text-xs … --gog-text-3xl`), which isn't usable as a literal list of real names.
// Editing anything here cascades into the whole library, since every component token
// derives from one of these (see theming.md's "How theming is layered").

export interface FoundationGroup {
  readonly title: string;
  readonly tokens: readonly string[];
}

export const FOUNDATION_GROUPS: readonly FoundationGroup[] = [
  {
    title: 'Fonts & Type Scale',
    tokens: [
      '--gog-font-heading',
      '--gog-font-body',
      '--gog-font-mono',
      '--gog-text-xs',
      '--gog-text-sm',
      '--gog-text-md',
      '--gog-text-lg',
      '--gog-text-slg',
      '--gog-text-xl',
      '--gog-text-2xl',
      '--gog-text-3xl',
    ],
  },
  {
    title: 'Palette',
    tokens: [
      '--gog-background-color',
      '--gog-surface-color',
      '--gog-hover-color',
      '--gog-border-color',
      '--gog-text-color',
      '--gog-accent-text-color',
      '--gog-muted-text-color',
      '--gog-primary-color',
      '--gog-accent-color',
      '--gog-accent-bright',
      '--gog-accent-dim',
      '--gog-accent-pale',
      '--gog-secondary-color',
      '--gog-success-color',
      '--gog-danger-color',
      '--gog-warning-color',
      '--gog-info-color',
      // A status colour is three tokens, not one (21.9.0), and all three have to be editable
      // together or this page generates the bug the library just fixed: pick a bright hue here,
      // leave the label at the accent's white, and `gogBadge` and `gog-button severity` paint
      // white on it. That measured 1.97:1 in one of the package's own presets before the label
      // token existed. `-shade` is which way hover and press deepen — away from the label, so it
      // is the ink when the label is white and the other way round when the label is the ink.
      '--gog-success-text-color',
      '--gog-danger-text-color',
      '--gog-warning-text-color',
      '--gog-info-text-color',
      '--gog-success-shade',
      '--gog-danger-shade',
      '--gog-warning-shade',
      '--gog-info-shade',
    ],
  },
  {
    // The short path to a custom look (docs/themes.md iteration 1): most component
    // tokens read one of these instead of declaring their own literal, so editing a
    // value here reshapes the whole library at once — the difference between
    // generating a palette and generating a theme.
    title: 'Character Layer',
    tokens: [
      '--gog-radius',
      '--gog-border-width',
      '--gog-border-style',
      '--gog-panel-border-width',
      '--gog-panel-border-style',
      '--gog-control-border-width',
      '--gog-control-border-style',
      '--gog-text-transform',
      '--gog-letter-spacing',
      // Weight and leading, the third and fourth axes of this layer (21.9.0). Both are unitless,
      // so `classifyToken` renders them as text fields rather than ranges — the same graceful
      // degradation the two casing tokens above and `--gog-density` below already rely on.
      '--gog-font-weight-medium',
      '--gog-font-weight-semibold',
      '--gog-font-weight-bold',
      '--gog-font-weight-heavy',
      '--gog-line-height-none',
      '--gog-line-height-tight',
      '--gog-line-height-snug',
      '--gog-line-height-normal',
      '--gog-line-height-relaxed',
      '--gog-line-height-loose',
      // Density belongs to this layer too (themes.md iteration 6, and the Theming page's
      // Character Layer table lists it) — and it is the single highest-leverage token here,
      // since the whole spacing scale below is `calc(Npx * var(--gog-density))`. Its value is
      // a bare `1`, which `classifyToken` cannot read as a range (`UNIT_RE` wants a unit), so
      // it renders as a text field — the same graceful degradation the two casing tokens above
      // already rely on.
      '--gog-density',
    ],
  },
  {
    // The five named aliases only. The 14 numeric steps they derive from
    // (`--gog-space-2` … `--gog-space-48`) are deliberately not fields here: they are the
    // scale's internals, and `--gog-density` above already moves all of them at once, which is
    // the edit a theme actually wants to make.
    title: 'Spacing',
    tokens: [
      '--gog-space-xs',
      '--gog-space-sm',
      '--gog-space-md',
      '--gog-space-lg',
      '--gog-space-2xl',
    ],
  },
  {
    title: 'Motion & Focus',
    tokens: [
      '--gog-duration-fast',
      '--gog-duration-base',
      '--gog-duration-slow',
      '--gog-focus-ring-width',
      '--gog-focus-ring-offset',
      '--gog-disabled-opacity',
    ],
  },
  {
    // One field, five derivations. The layer tokens (`--gog-badge-z` and friends) are each
    // `calc(var(--gog-z-base) + N)`, so editing the floor moves the whole library and keeps the
    // order — which is the edit a theme actually wants, the same argument `--gog-density` makes
    // for the spacing scale.
    title: 'Stacking',
    tokens: ['--gog-z-base'],
  },
  {
    title: 'Control Metrics',
    tokens: [
      '--gog-control-padding-y',
      '--gog-control-padding-x',
      '--gog-control-icon-offset',
      '--gog-control-clear-icon-ratio',
    ],
  },
];

export const FOUNDATION_TOKEN_NAMES: readonly string[] = FOUNDATION_GROUPS.flatMap(
  (group) => group.tokens,
);

export const PALETTE_TOKEN_NAMES: readonly string[] =
  FOUNDATION_GROUPS.find((group) => group.title === 'Palette')?.tokens ?? [];

export const FONT_TOKEN_NAMES: readonly string[] = [
  '--gog-font-heading',
  '--gog-font-body',
  '--gog-font-mono',
];
