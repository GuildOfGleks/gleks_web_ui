export type ShowcaseThemeName =
  | 'light'
  | 'dark'
  | 'slate'
  | 'one-dark'
  | 'one-light'
  | 'ledger'
  | 'material'
  | 'primeng'
  | 'terminal'
  | 'bevel'
  | 'parchment';

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
    summary: 'Soft modern — 12px corners, hairline borders, and a little more air.',
  },
  {
    name: 'one-dark',
    label: 'One Dark',
    summary: 'Editor chrome: the Atom palette, 4px corners, compact, sentence case.',
  },
  {
    name: 'one-light',
    label: 'One Light',
    summary: 'The same editor UI in light tones — identical shape, inverted palette.',
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
    name: 'terminal',
    label: 'Terminal',
    summary: 'Green phosphor on an unlit screen — monospaced throughout, no motion.',
  },
  {
    name: 'bevel',
    label: 'Bevel',
    summary: 'The early-web desktop: grey panels, raised buttons, sunken fields, navy.',
  },
  {
    name: 'parchment',
    label: 'Parchment',
    summary: 'Ink on laid paper — old-style serif, oxblood rubric, roomy margins.',
  },
] as const;
