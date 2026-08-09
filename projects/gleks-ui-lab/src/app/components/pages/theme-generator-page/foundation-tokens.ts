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
    title: 'Spacing & Radius',
    tokens: [
      '--gog-space-xs',
      '--gog-space-sm',
      '--gog-space-md',
      '--gog-space-lg',
      '--gog-space-2xl',
      '--gog-radius',
      '--gog-panel-border-width',
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
    tokens: [
      '--gog-control-padding-y',
      '--gog-control-padding-x',
      '--gog-control-icon-offset',
      '--gog-control-border-width',
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
