export interface ThemeOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Every theme the site can switch to — the header's menu and the site tour both offer it.
 * `light` and `dark` are built into `theme.css`; the other nine are the package's presets, each
 * loaded as its own stylesheet (see angular.json).
 */
export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Classic' },
  { value: 'dark', label: 'Dark' },
  { value: 'slate', label: 'Slate' },
  { value: 'one-dark', label: 'One Dark' },
  { value: 'one-light', label: 'One Light' },
  { value: 'ledger', label: 'Ledger' },
  { value: 'material', label: 'Material' },
  { value: 'primeng', label: 'PrimeNG' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'bevel', label: 'Bevel' },
  { value: 'parchment', label: 'Parchment' },
];
