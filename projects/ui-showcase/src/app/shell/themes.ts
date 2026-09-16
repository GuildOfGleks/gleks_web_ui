/** Every theme the package ships: `light`/`dark` from `theme.css`, the rest from `styles/presets/`. */
export const THEMES: readonly { readonly name: string; readonly label: string }[] = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'slate', label: 'Slate' },
  { name: 'one-dark', label: 'One Dark' },
  { name: 'one-light', label: 'One Light' },
  { name: 'ledger', label: 'Ledger' },
  { name: 'material', label: 'Material' },
  { name: 'primeng', label: 'PrimeNG' },
  { name: 'terminal', label: 'Terminal' },
  { name: 'bevel', label: 'Bevel' },
  { name: 'parchment', label: 'Parchment' },
];
