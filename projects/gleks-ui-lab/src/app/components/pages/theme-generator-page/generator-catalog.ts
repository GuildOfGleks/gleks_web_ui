export interface GeneratorComponentDef {
  readonly id: string;
  readonly label: string;
  /** `--gog-*` prefixes that belong to this component, matched with startsWith. */
  readonly prefixes: readonly string[];
}

// Alphabetical by label, matching the sidebar.
export const GENERATOR_COMPONENTS: readonly GeneratorComponentDef[] = [
  { id: 'accordion', label: 'Accordion', prefixes: ['--gog-accordion-'] },
  { id: 'autocomplete', label: 'Autocomplete', prefixes: ['--gog-autocomplete-'] },
  { id: 'badge', label: 'Badge', prefixes: ['--gog-badge-'] },
  { id: 'button', label: 'Button', prefixes: ['--gog-btn-'] },
  { id: 'button-toggle', label: 'Button Toggle', prefixes: ['--gog-button-toggle-'] },
  { id: 'calendar', label: 'Calendar', prefixes: ['--gog-calendar-'] },
  { id: 'checkbox', label: 'Checkbox', prefixes: ['--gog-checkbox-', '--gog-control-checkbox-'] },
  { id: 'chip', label: 'Chip', prefixes: ['--gog-chip-'] },
  { id: 'datepicker', label: 'Datepicker', prefixes: ['--gog-datepicker-'] },
  { id: 'dialog', label: 'Dialog', prefixes: ['--gog-dialog-', '--gog-confirm-'] },
  { id: 'divider', label: 'Divider', prefixes: ['--gog-divider-'] },
  { id: 'icon', label: 'Icon', prefixes: ['--gog-icon-'] },
  { id: 'inputfield', label: 'Input Field', prefixes: ['--gog-input-', '--gog-textarea-'] },
  // `--gog-ms-*` is the still-declared spelling; `--gog-multiselect-*` derives from it until
  // the old name is removed in 21.5.0, so both are listed to keep the generator complete.
  {
    id: 'multiselect',
    label: 'Multiselect',
    prefixes: ['--gog-ms-', '--gog-multiselect-'],
  },
  { id: 'paginator', label: 'Paginator', prefixes: ['--gog-paginator-'] },
  { id: 'progressbar', label: 'Progress Bar', prefixes: ['--gog-progressbar-'] },
  { id: 'radio-group', label: 'Radio Group', prefixes: ['--gog-radio-'] },
  { id: 'select', label: 'Select', prefixes: ['--gog-select-'] },
  { id: 'skeleton', label: 'Skeleton', prefixes: ['--gog-skeleton-'] },
  { id: 'slider', label: 'Slider', prefixes: ['--gog-slider-'] },
  { id: 'spinner', label: 'Spinner', prefixes: ['--gog-spinner-'] },
  { id: 'table', label: 'Table', prefixes: ['--gog-table-'] },
  { id: 'tabs', label: 'Tabs', prefixes: ['--gog-tabs-'] },
  { id: 'tag', label: 'Tag', prefixes: ['--gog-tag-'] },
  { id: 'toast', label: 'Toast', prefixes: ['--gog-toast-'] },
  { id: 'toggle', label: 'Toggle', prefixes: ['--gog-toggle-'] },
  { id: 'tooltip', label: 'Tooltip', prefixes: ['--gog-tooltip-'] },
];

const DECLARATION_RE = /(--gog-[a-zA-Z0-9-]+)\s*:/g;

/**
 * Discovers every concrete `--gog-*` token declared in the library's real stylesheets that
 * belongs to one of the given prefixes — instead of a hand-maintained list, so the generator
 * always covers every token the installed library version actually ships.
 */
export function extractTokenNames(css: string, prefixes: readonly string[]): string[] {
  const found = new Set<string>();
  for (const match of css.matchAll(DECLARATION_RE)) {
    const name = match[1];
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      found.add(name);
    }
  }
  return [...found].sort();
}
