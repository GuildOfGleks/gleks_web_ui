export type ShowcaseThemeName =
  'light' | 'dark' | 'slate' | 'one-dark' | 'one-light' | 'ledger' | 'material' | 'primeng';

export interface ShowcaseThemePreset {
  readonly name: ShowcaseThemeName;
  readonly label: string;
  readonly summary: string;
}

/*
 * Every entry here is a theme the *package* ships — `light`/`dark` from `theme.css`, and the six
 * importable presets under `styles/presets/`. The showcase deliberately declares no themes of its
 * own: a switcher option a consumer cannot install teaches nothing about the library.
 */
export const showcaseThemes: ShowcaseThemePreset[] = [
  {
    name: 'light',
    label: 'Light',
    summary: "The library's own light palette — the baseline every preset is measured against.",
  },
  {
    name: 'dark',
    label: 'Dark',
    summary: "The library's own dark palette — same metrics as Light, inverted tones.",
  },
  {
    name: 'slate',
    label: 'Slate',
    summary: 'The palette-only worked example — cool greys, library metrics untouched.',
  },
  {
    name: 'one-dark',
    label: 'One Dark',
    summary: 'The editor palette, shipped in the package as styles/presets/one-dark.css.',
  },
  {
    name: 'one-light',
    label: 'One Light',
    summary: 'Its light counterpart — same hue roles, inverted chrome.',
  },
  {
    name: 'ledger',
    label: 'Ledger',
    summary: 'Square corners, hard offset shadows, no motion — administrative software.',
  },
  {
    name: 'material',
    label: 'Material',
    summary: 'Material Design 3 baseline: pill buttons, a non-uniform shape scale.',
  },
  {
    name: 'primeng',
    label: 'PrimeNG',
    summary: "PrimeNG Aura's blue primary, thin borders, and sentence-case labels.",
  },
] as const;
