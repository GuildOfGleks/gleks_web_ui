export type ShowcaseThemeName =
  | 'light'
  | 'dark'
  | 'slate'
  | 'one-dark'
  | 'one-light'
  | 'ledger'
  | 'material'
  | 'primeng'
  | 'cyberpunk'
  | 'warcraft'
  | 'red-alert-3';

export interface ShowcaseThemePreset {
  readonly name: ShowcaseThemeName;
  readonly label: string;
  readonly summary: string;
}

export const showcaseThemes: ShowcaseThemePreset[] = [
  {
    name: 'light',
    label: 'Classic',
    summary: 'Warm editorial baseline with soft spacing and restrained borders.',
  },
  {
    name: 'dark',
    label: 'Dark',
    summary: "The library's own dark palette — same metrics as Classic, inverted tones.",
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
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    summary: 'Neon panels, sharp geometry, vivid contrast, and compact controls.',
  },
  {
    name: 'warcraft',
    label: 'Warcraft',
    summary: 'Ornate fantasy styling with parchment tones and carved borders.',
  },
  {
    name: 'red-alert-3',
    label: 'Red Alert 3',
    summary: 'Military UI with hard edges, dense typography, and warning colors.',
  },
] as const;
