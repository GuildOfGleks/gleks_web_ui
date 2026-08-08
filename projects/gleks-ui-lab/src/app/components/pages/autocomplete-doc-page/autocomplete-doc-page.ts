import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AutocompleteComponent, GogDropdownOptionDirective } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

const OWN_INPUTS: readonly ApiRow[] = [
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
  imports: [
    AutocompleteComponent,
    GogDropdownOptionDirective,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './autocomplete-doc-page.html',
  styleUrl: './autocomplete-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDocPage {
  protected readonly cities = CITIES;

  protected readonly city = signal<number | null>(null);
  protected readonly cityObject = signal<City | null>(null);
  protected readonly slotCity = signal<number | null>(null);
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

  protected readonly overviewHtml = [
    '<gog-autocomplete',
    '  label="City"',
    '  placeholder="Start typing…"',
    '  [options]="cities"',
    '  [(value)]="city"',
    '/>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AutocompleteComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AutocompleteComponent],',
    '  template: `',
    '    <gog-autocomplete',
    '      label="City"',
    '      placeholder="Start typing…"',
    '      [options]="cities"',
    '      [(value)]="city"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly cities = [',
    "    { id: 1, name: 'Amsterdam', country: 'Netherlands' },",
    "    { id: 2, name: 'Berlin', country: 'Germany' },",
    '    // …',
    '  ];',
    '  protected readonly city = signal<number | null>(null);',
    '}',
  ].join('\n');

  protected readonly serverHtml = [
    '<gog-autocomplete',
    '  label="City"',
    '  [options]="results()"',
    '  [loading]="loading()"',
    '  [filterLocal]="false"',
    '  [searchDebounce]="300"',
    '  [minLength]="2"',
    '  (gogSearch)="search($event)"',
    '  [(value)]="city"',
    '/>',
  ].join('\n');
  protected readonly serverTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AutocompleteComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AutocompleteComponent],',
    '  template: `',
    '    <gog-autocomplete',
    '      [options]="results()"',
    '      [loading]="loading()"',
    '      [filterLocal]="false"',
    '      (gogSearch)="search($event)"',
    '      [(value)]="city"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly results = signal<City[]>([]);',
    '  protected readonly loading = signal(false);',
    '',
    '  // gogSearch is already debounced by searchDebounce (300 ms by default).',
    '  protected search(query: string): void {',
    '    this.loading.set(true);',
    '    this.api.findCities(query).subscribe((cities) => {',
    '      this.results.set(cities);',
    '      this.loading.set(false);',
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected readonly dtoHtml = [
    '<!-- optionValue="null" hands back the option object itself, not an id. -->',
    '<gog-autocomplete',
    '  label="City"',
    '  optionLabel="name"',
    '  [optionValue]="null"',
    '  [options]="cities"',
    '  [(value)]="cityObject"',
    '/>',
  ].join('\n');
  protected readonly dtoTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AutocompleteComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AutocompleteComponent],',
    '  template: `',
    '    <gog-autocomplete',
    '      optionLabel="name"',
    '      [optionValue]="null"',
    '      [options]="cities"',
    '      [(value)]="cityObject"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // The same object reference you passed in comes back out.',
    '  protected readonly cityObject = signal<City | null>(null);',
    '}',
  ].join('\n');

  protected readonly slotHtml = [
    '<gog-autocomplete label="City" [options]="cities" [(value)]="slotCity">',
    '  <ng-template gogDropdownOption let-option let-label="label">',
    '    <strong>{{ label }}</strong>',
    '    <small>{{ option.country }}</small>',
    '  </ng-template>',
    '</gog-autocomplete>',
  ].join('\n');
  protected readonly slotTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AutocompleteComponent, GogDropdownOptionDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AutocompleteComponent, GogDropdownOptionDirective],',
    '  template: `',
    '    <gog-autocomplete label="City" [options]="cities" [(value)]="slotCity">',
    '      <ng-template gogDropdownOption let-option let-label="label">',
    '        <strong>{{ label }}</strong>',
    '        <small>{{ asCity(option).country }}</small>',
    '      </ng-template>',
    '    </gog-autocomplete>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected asCity(option: unknown): City {',
    '    return option as City;',
    '  }',
    '}',
  ].join('\n');

  protected readonly freeTextHtml = [
    '<!-- forceSelection="false": what was typed is itself meaningful. -->',
    '<gog-autocomplete',
    '  label="Tag"',
    '  [forceSelection]="false"',
    '  [options]="cities"',
    '  (gogSearch)="draft.set($event)"',
    '  [(value)]="freeText"',
    '/>',
  ].join('\n');
  protected readonly freeTextTs = [
    "import { Component, signal } from '@angular/core';",
    "import { AutocompleteComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [AutocompleteComponent],',
    '  template: `',
    '    <gog-autocomplete',
    '      [forceSelection]="false"',
    '      [options]="cities"',
    '      (gogSearch)="draft.set($event)"',
    '      [(value)]="freeText"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // With forceSelection off, read what the user typed from gogSearch, not from value.',
    "  protected readonly draft = signal('');",
    '}',
  ].join('\n');

  protected asCity(option: unknown): City {
    return option as City;
  }

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
}
