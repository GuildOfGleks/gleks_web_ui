import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogDropdownOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { MULTISELECT_EXAMPLE_SOURCES } from '../../../examples/multiselect/sources.generated';
import { MultiselectAccessorsExample } from '../../../examples/multiselect/multiselect-accessors/example';
import { MultiselectAppendToBodyExample } from '../../../examples/multiselect/multiselect-append-to-body/example';
import { MultiselectChevronExample } from '../../../examples/multiselect/multiselect-chevron/example';
import { MultiselectControlsExample } from '../../../examples/multiselect/multiselect-controls/example';
import { MultiselectFilterExample } from '../../../examples/multiselect/multiselect-filter/example';
import { MultiselectFormExample } from '../../../examples/multiselect/multiselect-form/example';
import { MultiselectFullWidthExample } from '../../../examples/multiselect/multiselect-full-width/example';
import { MultiselectOptionSlotExample } from '../../../examples/multiselect/multiselect-option-slot/example';
import { MultiselectOverviewExample } from '../../../examples/multiselect/multiselect-overview/example';
import { MultiselectSelectedNamesExample } from '../../../examples/multiselect/multiselect-selected-names/example';
import { MultiselectSizesExample } from '../../../examples/multiselect/multiselect-sizes/example';
import { MultiselectStatesExample } from '../../../examples/multiselect/multiselect-states/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

/** A deliberately un-`GogDropdownOption`-shaped DTO, to show the accessors doing their job. */
const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'selectAllLabel',
    type: 'string | undefined',
    default: "'Select all'",
    description:
      "Visible text of the panel's select-all button (shown when showControls is on). Also via GOG_CONFIG.labels.selectAll.",
    since: '21.3.2',
  },
  {
    name: 'clearAllLabel',
    type: 'string | undefined',
    default: "'Clear'",
    description: 'The clear-all button next to it. Also via GOG_CONFIG.labels.clearAll.',
    since: '21.3.2',
  },
  {
    name: 'value',
    type: '(string | number)[] (model)',
    default: '[]',
    description:
      'Two-way bindable selected option ids via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the field when there is no visible label.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Select...'",
    description: 'Text shown while no option is selected.',
  },
  {
    name: 'options',
    type: 'TOption[]',
    default: '[]',
    description:
      'The list of choices — your own objects. GogDropdownOption ({ id, name, disabled? }) is just the shape the default accessors expect, not a requirement.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description:
      'How an option turns into its visible text: a property path (dot-paths included) or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into an emitted value. Set it to null and the control emits the option OBJECTS themselves.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which options cannot be picked.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'GOG_CONFIG.control.clearable ?? true',
    description:
      'Adds a clear button in the outermost trailing position. Deliberately the one control that defaults to true: gog-multiselect shipped a clear button before this input existed, and defaulting it to false would have silently removed it.',
  },
  {
    name: 'clearAriaLabel',
    type: 'string',
    default: "'Clear selection'",
    description: 'Accessible name for that clear button.',
  },
  {
    name: 'filter',
    type: 'boolean',
    default: 'GOG_CONFIG.dropdown.filter ?? false',
    description:
      'Puts a search box in the panel, matching case-insensitively on the resolved optionLabel. "Select all" then takes only the VISIBLE options, so it means what it says while a filter is active.',
  },
  {
    name: 'filterPosition',
    type: "'top' | 'bottom'",
    default: "GOG_CONFIG.dropdown.filterPosition ?? 'top'",
    description:
      'Which end of the panel the search box sticks to — the same vocabulary as controlsPosition, rather than a second one for the same idea.',
  },
  {
    name: 'filterPlaceholder / filterEmptyMessage',
    type: 'string',
    default: "'Search...' / 'No matches'",
    description: 'Wording for the search box and for the empty result.',
  },
  {
    name: 'filterMatch',
    type: '((option: TOption, query: string) => boolean) | null',
    default: 'null',
    description: 'Replaces the default case-insensitive substring match with your own predicate.',
  },
  {
    name: 'floatLabel',
    type: "'none' | 'in' | 'on' | 'over'",
    default: "GOG_CONFIG.floatLabel.variant ?? 'none'",
    description:
      'Rests the label inside the field like a placeholder and floats it up once the selection is non-empty or the field has focus.',
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description: 'Reveals the placeholder once the label has floated out of the way.',
  },
  {
    name: 'minWidth',
    type: 'string | null',
    default: 'null (--gog-multiselect-min-width, 120px)',
    description:
      'Floor for an auto-width trigger, any CSS length — so a short selection cannot collapse the field to its own chrome.',
  },
  {
    name: 'showControls',
    type: 'boolean',
    default: 'false',
    description: 'Shows a "select all" / "clear" row above (or below) the option list.',
  },
  {
    name: 'controlsPosition',
    type: "'top' | 'bottom'",
    default: "'top'",
    description:
      'Where the select-all/clear row sits relative to the option list. Sticky either way, so it stays visible while a long list scrolls.',
  },
  {
    name: 'clearIconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Deprecated since 21.3.0, removed in 21.5.0 — project an <ng-template gogMultiselectClearIcon> instead. Still works, and the projected slot wins when both are present.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: 'Error text to display. Visibility is governed by errorDisplay.',
  },
  {
    name: 'errorDisplay',
    type: "'auto' | 'manual'",
    default: "GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description:
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one.",
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Field height, padding, and font size.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the trigger and closes the panel if it is open.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description:
      'Fills its container by default. Set false to shrink to fit the selected summary instead.',
  },
  {
    name: 'dropdownDirection',
    type: "'auto' | 'up' | 'down'",
    default: "GOG_CONFIG.dropdown.direction ?? 'auto'",
    description:
      "Which side the panel opens on. 'auto' flips to whichever side has room in the viewport.",
  },
  {
    name: 'dropdownZIndex',
    type: 'number | null',
    default: 'null',
    description:
      'Explicit stacking order for the panel. Left unset it falls back to the --gog-dropdown-z token.',
  },
  {
    name: 'dropdownWidth',
    type: 'string | null',
    default: 'null',
    description:
      'Fixed panel width, any CSS length. Applies only with appendToBody. Left unset, the panel sizes to its own content with the trigger width as a floor, capped by --gog-{select,multiselect}-panel-max-width — so picking a short option no longer cuts the longer ones off the list.',
  },
  {
    name: 'dropdownMaxHeight',
    type: 'string | null',
    default: 'null',
    description: 'Fixed panel max-height, any CSS length. Applies only with appendToBody.',
  },
  {
    name: 'appendToBody',
    type: 'boolean',
    default: 'GOG_CONFIG.dropdown.appendToBody ?? false',
    description:
      "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping.",
  },
  {
    name: 'chevronTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Deprecated since 21.3.0, removed in 21.5.0 — project an <ng-template gogDropdownChevron> instead. Still works, and the projected slot wins when both are present.',
  },
];

@Component({
  selector: 'app-multiselect-doc-page',
  imports: [
    ExampleHostComponent,
    MultiselectComponent,
    MarkdownComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
  ],
  providers: [provideExampleSources(MULTISELECT_EXAMPLE_SOURCES)],
  templateUrl: './multiselect-doc-page.html',
  styleUrl: './multiselect-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'multiselect')?.tokens ?? [];

  protected readonly manyCountries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly importSnippet =
    "```typescript\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [MultiselectComponent],\n})\n```";

  // ---- 21.3.0: option accessors, filtering, option slot -----------------------------------

  protected readonly reviewerIds = signal<(string | number)[]>([]);
  protected readonly filteredCountries = signal<(string | number)[]>([]);
  protected readonly overflowCountries = signal<(string | number)[]>([]);

  /** Each example is a file under `src/app/examples/multiselect/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    accessors: MultiselectAccessorsExample,
    appendToBody: MultiselectAppendToBodyExample,
    chevron: MultiselectChevronExample,
    controls: MultiselectControlsExample,
    filter: MultiselectFilterExample,
    form: MultiselectFormExample,
    fullWidth: MultiselectFullWidthExample,
    optionSlot: MultiselectOptionSlotExample,
    overview: MultiselectOverviewExample,
    selectedNames: MultiselectSelectedNamesExample,
    sizes: MultiselectSizesExample,
    states: MultiselectStatesExample,
  };
}
