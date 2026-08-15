import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { AUTOCOMPLETE_EXAMPLE_SOURCES } from '../../../examples/autocomplete/sources.generated';
import { AutocompleteDtoExample } from '../../../examples/autocomplete/autocomplete-dto/example';
import { AutocompleteFreeTextExample } from '../../../examples/autocomplete/autocomplete-free-text/example';
import { AutocompleteOverviewExample } from '../../../examples/autocomplete/autocomplete-overview/example';
import { AutocompleteServerExample } from '../../../examples/autocomplete/autocomplete-server/example';
import { AutocompleteSlotExample } from '../../../examples/autocomplete/autocomplete-slot/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

const OWN_INPUTS: readonly ApiRow[] = [
  {
    name: 'openOnFocus',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Whether focusing the field opens the panel immediately with the full option list, rather than waiting for minLength characters. Unset, falls back to GOG_CONFIG.autocomplete.openOnFocus, then to true.',
    since: '21.3.1',
  },
  {
    name: 'value',
    type: 'TValue',
    default: 'null',
    description:
      'The selected value — whatever optionValue resolves to. Two-way bindable with [(value)].',
  },
  {
    name: 'filterLocal',
    type: 'boolean',
    default: 'true',
    description:
      'Whether options are narrowed in the browser as you type. Turn it OFF when gogSearch fetches an already-filtered list: filtering that answer a second time is the classic double-filtering bug, and it silently drops rows the server matched on a field this component cannot see.',
  },
  {
    name: 'minLength',
    type: 'number',
    default: 'GOG_CONFIG.autocomplete.minLength ?? 1',
    description: 'How many characters before the panel opens at all.',
  },
  {
    name: 'searchDebounce',
    type: 'number',
    default: 'GOG_CONFIG.autocomplete.searchDebounce ?? 300',
    description: 'Milliseconds of quiet before gogSearch fires. 0 emits on every keystroke.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner in the trailing slot, for a server-backed source still fetching.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No matches'",
    description: 'Shown in place of the list when nothing matches.',
  },
  {
    name: 'forceSelection',
    type: 'boolean',
    default: 'true',
    description:
      'On, the field always ends up reflecting a real selection — editing is transient and Escape or blur snaps the text back. Off, the typed text is itself meaningful (a create-as-you-type flow): it survives blur and value is dropped as soon as it stops matching, so the two never disagree.',
  },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: 'id for the inner <input>, for an external <label for="…">.',
  },
];

const SHARED_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'TOption[]',
    default: '[]',
    description: 'The suggestions. Your own objects.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description: 'Property path (dot-paths included) or function producing an option’s label.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description: 'What the control emits. null emits the option object itself.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which suggestions cannot be picked.',
  },
  {
    name: 'filterMatch',
    type: '((option: TOption, query: string) => boolean) | null',
    default: 'null',
    description:
      'How filterLocal matches an option against the typed text. Left null, the resolved optionLabel is matched case-insensitively as a substring.',
  },
  {
    name: 'label / placeholder / ariaLabel',
    type: 'string',
    default: "'' / 'Select...' / ''",
    description: 'Field label, placeholder and accessible name.',
  },
  {
    name: 'clearable / clearAriaLabel',
    type: 'boolean / string',
    default: "GOG_CONFIG.control.clearable ?? false / 'Clear selection'",
    description: 'A clear button that appears only once there is something to clear.',
  },
  {
    name: 'floatLabel / floatLabelShowPlaceholder',
    type: "'none' | 'in' | 'on' | 'over' / boolean",
    default: "GOG_CONFIG.floatLabel.* ?? 'none' / false",
    description: 'Float-label variant and whether the placeholder reappears once it has floated.',
  },
  {
    name: 'errorMessage / errorDisplay',
    type: "string / 'manual' | 'auto'",
    default: "'' / GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description: 'Validation message, shown manually or derived from the bound form control.',
  },
  {
    name: 'size / disabled / fullWidth / minWidth',
    type: 'GogSize / boolean / boolean / string | null',
    default: "GOG_CONFIG.control.size ?? 'md' / false / true / null",
    description: 'Density, disabled state, and how the field sizes itself.',
  },
  {
    name: 'appendToBody / dropdownDirection / dropdownWidth / dropdownMaxHeight / dropdownZIndex',
    type: 'boolean / GogDropdownDirection / string | null / string | null / number | null',
    default: 'GOG_CONFIG.dropdown.* ?? component defaults',
    description:
      'Panel placement. appendToBody renders it into <body> so an overflow-clipped ancestor cannot cut it off.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogSearch',
    type: 'string',
    default: '—',
    description: 'The current query, debounced. Wire a server-side lookup to this.',
  },
  {
    name: 'gogLoadMore',
    type: 'void',
    default: '—',
    description:
      'The panel was scrolled to the end. Fetch the next page and append it to options — this is how a large or server-backed option source is paged without a virtual scroller.',
    since: '21.3.1',
  },
  {
    name: 'valueChange',
    type: 'TValue',
    default: '—',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const CITIES: City[] = [
  { id: 1, name: 'Amsterdam', country: 'Netherlands' },
  { id: 2, name: 'Antwerp', country: 'Belgium' },
  { id: 3, name: 'Athens', country: 'Greece' },
  { id: 4, name: 'Barcelona', country: 'Spain' },
  { id: 5, name: 'Belgrade', country: 'Serbia' },
  { id: 6, name: 'Berlin', country: 'Germany' },
  { id: 7, name: 'Bratislava', country: 'Slovakia' },
  { id: 8, name: 'Bucharest', country: 'Romania' },
  { id: 9, name: 'Budapest', country: 'Hungary' },
  { id: 10, name: 'Copenhagen', country: 'Denmark' },
  { id: 11, name: 'Dublin', country: 'Ireland' },
  { id: 12, name: 'Kyiv', country: 'Ukraine' },
  { id: 13, name: 'Lisbon', country: 'Portugal' },
  { id: 14, name: 'Ljubljana', country: 'Slovenia' },
  { id: 15, name: 'Prague', country: 'Czechia' },
  { id: 16, name: 'Riga', country: 'Latvia' },
  { id: 17, name: 'Stockholm', country: 'Sweden' },
  { id: 18, name: 'Vienna', country: 'Austria' },
  { id: 19, name: 'Warsaw', country: 'Poland' },
  { id: 20, name: 'Zagreb', country: 'Croatia' },
];

@Component({
  selector: 'app-autocomplete-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  providers: [provideExampleSources(AUTOCOMPLETE_EXAMPLE_SOURCES)],
  templateUrl: './autocomplete-doc-page.html',
  styleUrl: './autocomplete-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDocPage {
  protected readonly city = signal<number | null>(null);
  protected readonly freeText = signal<number | null>(null);
  protected readonly lastQuery = signal('');
  protected readonly serverLoading = signal(false);
  protected readonly serverResults = signal<City[]>([]);

  protected readonly apiInputs = OWN_INPUTS;
  protected readonly sharedInputs = SHARED_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'autocomplete')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [AutocompleteComponent],\n})\n```";

  /** Stands in for a server lookup so the demo can show `loading` and `filterLocal="false"`. */
  protected search(query: string): void {
    this.lastQuery.set(query);
    this.serverLoading.set(true);
    const needle = query.trim().toLowerCase();
    setTimeout(() => {
      this.serverResults.set(
        needle
          ? CITIES.filter(
              (city) =>
                city.name.toLowerCase().includes(needle) ||
                city.country.toLowerCase().includes(needle),
            )
          : [],
      );
      this.serverLoading.set(false);
    }, 400);
  }
  /** Each example is a file under `src/app/examples/autocomplete/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    dto: AutocompleteDtoExample,
    freeText: AutocompleteFreeTextExample,
    overview: AutocompleteOverviewExample,
    server: AutocompleteServerExample,
    slot: AutocompleteSlotExample,
  };
}
