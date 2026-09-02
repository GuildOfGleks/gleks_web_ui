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
    title: 'Control Metrics',
    tokens: ['--gog-control-padding-y', '--gog-control-padding-x', '--gog-control-icon-offset'],
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
