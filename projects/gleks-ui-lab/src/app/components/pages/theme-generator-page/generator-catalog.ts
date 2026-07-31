export interface GeneratorComponentDef {
  readonly id: string;
  readonly label: string;
  /** `--gog-*` prefixes that belong to this component, matched with startsWith. */
  readonly prefixes: readonly string[];
}

export const GENERATOR_COMPONENTS: readonly GeneratorComponentDef[] = [
  { id: 'accordion', label: 'Accordion', prefixes: ['--gog-accordion-'] },
  { id: 'button', label: 'Button', prefixes: ['--gog-btn-'] },
  { id: 'checkbox', label: 'Checkbox', prefixes: ['--gog-checkbox-', '--gog-control-checkbox-'] },
  { id: 'chip', label: 'Chip', prefixes: ['--gog-chip-'] },
  { id: 'dialog', label: 'Dialog', prefixes: ['--gog-dialog-', '--gog-confirm-'] },
  { id: 'icon', label: 'Icon', prefixes: ['--gog-icon-'] },
  { id: 'inputfield', label: 'Input Field', prefixes: ['--gog-input-'] },
  { id: 'multiselect', label: 'Multiselect', prefixes: ['--gog-ms-'] },
  { id: 'paginator', label: 'Paginator', prefixes: ['--gog-paginator-'] },
  { id: 'select', label: 'Select', prefixes: ['--gog-select-'] },
  { id: 'skeleton', label: 'Skeleton', prefixes: ['--gog-skeleton-'] },
  { id: 'slider', label: 'Slider', prefixes: ['--gog-slider-'] },
  { id: 'spinner', label: 'Spinner', prefixes: ['--gog-spinner-'] },
  { id: 'table', label: 'Table', prefixes: ['--gog-table-'] },
  { id: 'tag', label: 'Tag', prefixes: ['--gog-tag-'] },
  { id: 'toast', label: 'Toast', prefixes: ['--gog-toast-'] },
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
