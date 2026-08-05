export type ShowcaseThemeName = 'light' | 'dark' | 'cyberpunk' | 'warcraft' | 'red-alert-3';

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
