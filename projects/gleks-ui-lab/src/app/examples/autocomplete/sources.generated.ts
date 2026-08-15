// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { AutocompleteDtoExample } from './autocomplete-dto/example';
import { AutocompleteFreeTextExample } from './autocomplete-free-text/example';
import { AutocompleteOverviewExample } from './autocomplete-overview/example';
import { AutocompleteServerExample } from './autocomplete-server/example';
import { AutocompleteSlotExample } from './autocomplete-slot/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const AUTOCOMPLETE_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    AutocompleteDtoExample,
    {
      html: '<div class="example">\n  <gog-autocomplete\n    optionLabel="name"\n    [optionValue]="null"\n    [options]="cities"\n    [(value)]="cityObject"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\ninterface City {\n  readonly id: number;\n  readonly name: string;\n  readonly country: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [AutocompleteComponent],\n})\nexport class AutocompleteDtoExample {\n  protected readonly cities: City[] = [\n    { id: 1, name: 'Amsterdam', country: 'Netherlands' },\n    { id: 2, name: 'Barcelona', country: 'Spain' },\n    { id: 3, name: 'Berlin', country: 'Germany' },\n    { id: 4, name: 'Copenhagen', country: 'Denmark' },\n    { id: 5, name: 'Kyiv', country: 'Ukraine' },\n    { id: 6, name: 'Lisbon', country: 'Portugal' },\n  ];\n  // The same object reference you passed in comes back out.\n  protected readonly cityObject = signal<City | null>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    AutocompleteFreeTextExample,
    {
      html: '<div class="example">\n  <gog-autocomplete\n    [forceSelection]="false"\n    [options]="cities"\n    (gogSearch)="draft.set($event)"\n    [(value)]="freeText"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\ninterface City {\n  readonly id: number;\n  readonly name: string;\n  readonly country: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [AutocompleteComponent],\n})\nexport class AutocompleteFreeTextExample {\n  protected readonly cities: City[] = [\n    { id: 1, name: 'Amsterdam', country: 'Netherlands' },\n    { id: 2, name: 'Barcelona', country: 'Spain' },\n    { id: 3, name: 'Berlin', country: 'Germany' },\n    { id: 4, name: 'Copenhagen', country: 'Denmark' },\n    { id: 5, name: 'Kyiv', country: 'Ukraine' },\n    { id: 6, name: 'Lisbon', country: 'Portugal' },\n  ];\n  protected readonly freeText = signal<number | null>(null);\n  // With forceSelection off, read what the user typed from gogSearch, not from value.\n  protected readonly draft = signal('');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    AutocompleteOverviewExample,
    {
      html: '<div class="example">\n  <gog-autocomplete label="City" placeholder="Start typing…" [options]="cities" [(value)]="city" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [AutocompleteComponent],\n})\nexport class AutocompleteOverviewExample {\n  protected readonly cities = [\n    { id: 1, name: 'Amsterdam', country: 'Netherlands' },\n    { id: 2, name: 'Berlin', country: 'Germany' },\n    // …\n  ];\n  protected readonly city = signal<number | null>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    AutocompleteServerExample,
    {
      html: '<div class="example">\n  <gog-autocomplete\n    label="City"\n    [options]="results()"\n    [loading]="loading()"\n    [filterLocal]="false"\n    (gogSearch)="search($event)"\n    [(value)]="city"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\ninterface City {\n  readonly id: number;\n  readonly name: string;\n  readonly country: string;\n}\n\nconst ALL_CITIES: City[] = [\n  { id: 1, name: 'Amsterdam', country: 'Netherlands' },\n  { id: 2, name: 'Barcelona', country: 'Spain' },\n  { id: 3, name: 'Berlin', country: 'Germany' },\n  { id: 4, name: 'Copenhagen', country: 'Denmark' },\n  { id: 5, name: 'Kyiv', country: 'Ukraine' },\n  { id: 6, name: 'Lisbon', country: 'Portugal' },\n];\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [AutocompleteComponent],\n})\nexport class AutocompleteServerExample {\n  protected readonly results = signal<City[]>([]);\n  protected readonly loading = signal(false);\n  protected readonly city = signal<number | null>(null);\n\n  // `filterLocal: false` hands filtering to you. `gogSearch` is already debounced by\n  // `searchDebounce` (300 ms by default), so this is one request per pause in typing.\n  protected search(query: string): void {\n    this.loading.set(true);\n    // Your HTTP call goes here — a timeout stands in for it so the example runs anywhere.\n    setTimeout(() => {\n      const term = query.toLowerCase();\n      this.results.set(ALL_CITIES.filter((city) => city.name.toLowerCase().includes(term)));\n      this.loading.set(false);\n    }, 400);\n  }\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    AutocompleteSlotExample,
    {
      html: '<div class="example">\n  <gog-autocomplete label="City" [options]="cities" [(value)]="slotCity">\n    <ng-template gogDropdownOption let-option let-label="label">\n      <strong>{{ label }}</strong>\n      <small>{{ asCity(option).country }}</small>\n    </ng-template>\n  </gog-autocomplete>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { AutocompleteComponent, GogDropdownOptionDirective } from '@guildofgleks/ui';\n\ninterface City {\n  readonly id: number;\n  readonly name: string;\n  readonly country: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [AutocompleteComponent, GogDropdownOptionDirective],\n})\nexport class AutocompleteSlotExample {\n  protected readonly cities: City[] = [\n    { id: 1, name: 'Amsterdam', country: 'Netherlands' },\n    { id: 2, name: 'Barcelona', country: 'Spain' },\n    { id: 3, name: 'Berlin', country: 'Germany' },\n    { id: 4, name: 'Copenhagen', country: 'Denmark' },\n    { id: 5, name: 'Kyiv', country: 'Ukraine' },\n    { id: 6, name: 'Lisbon', country: 'Portugal' },\n  ];\n  protected readonly slotCity = signal<number | null>(null);\n  protected asCity(option: unknown): City {\n    return option as City;\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
