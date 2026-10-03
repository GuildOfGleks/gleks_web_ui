import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { MULTISELECT_EXAMPLES } from '../../../examples/multiselect/sources.generated';
import { MultiselectAccessorsExample } from '../../../examples/multiselect/multiselect-accessors/example';
import { MultiselectAppendToBodyExample } from '../../../examples/multiselect/multiselect-append-to-body/example';
import { MultiselectConfigExample } from '../../../examples/multiselect/multiselect-config/example';
import { MultiselectControlsExample } from '../../../examples/multiselect/multiselect-controls/example';
import { MultiselectDisabledOptionExample } from '../../../examples/multiselect/multiselect-disabled-option/example';
import { MultiselectFilterExample } from '../../../examples/multiselect/multiselect-filter/example';
import { MultiselectFloatLabelExample } from '../../../examples/multiselect/multiselect-float-label/example';
import { MultiselectFormsExample } from '../../../examples/multiselect/multiselect-forms/example';
import { MultiselectOverflowExample } from '../../../examples/multiselect/multiselect-overflow/example';
import { MultiselectOverviewExample } from '../../../examples/multiselect/multiselect-overview/example';
import { MultiselectSizesExample } from '../../../examples/multiselect/multiselect-sizes/example';
import { MultiselectSlotsExample } from '../../../examples/multiselect/multiselect-slots/example';
import { MultiselectStatesExample } from '../../../examples/multiselect/multiselect-states/example';
import { MultiselectVirtualizeExample } from '../../../examples/multiselect/multiselect-virtualize/example';
import { MultiselectWidthExample } from '../../../examples/multiselect/multiselect-width/example';

const API_INPUTS: readonly ApiRow[] = [
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
    type: 'readonly TOption[]',
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
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each option row in the panel. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
  {
    name: 'virtualize',
    type: 'boolean | undefined',
    default: 'GOG_CONFIG.dropdown.virtualize ?? false',
    description:
      'Renders only the option rows in view — about twenty in the DOM whatever the list holds. Off by default and never switched on at a row count: Ctrl+F finds only rendered rows and :last-child matches the last rendered one. aria-setsize/aria-posinset keep the announced count real.',
    since: '21.13.0',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'TValue[]',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogDropdownOption',
    type: '$implicit, selected, disabled, label',
    description: 'Replaces one option row. The per-option checkbox stays.',
  },
  {
    name: '[gogDropdownOptionTypeOf]',
    type: 'readonly TOption[] — an input on gogDropdownOption',
    description:
      'Bind the same array as options and $implicit is typed as its element instead of unknown. Never read at runtime; left unbound, the template compiles exactly as before.',
    since: '21.15.0',
  },
  {
    name: 'gogDropdownChevron',
    type: '$implicit / open',
    description:
      'Replaces the trigger chevron. The library turns only its own; a custom one draws its state from open.',
    since: '21.15.0',
  },
  {
    name: 'gogMultiselectClearIcon',
    type: '—',
    description:
      "Replaces the glyph inside the clear button; the button and its name stay the component's.",
  },
];

@Component({
  selector: 'app-multiselect-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './multiselect-doc-page.html',
  styleUrl: './multiselect-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'multiselect')?.tokens ?? [];

  protected readonly sources = MULTISELECT_EXAMPLES;
  protected readonly examples = {
    overview: MultiselectOverviewExample,
    sizes: MultiselectSizesExample,
    states: MultiselectStatesExample,
    overflow: MultiselectOverflowExample,
    width: MultiselectWidthExample,
    slots: MultiselectSlotsExample,
    accessors: MultiselectAccessorsExample,
    disabledOption: MultiselectDisabledOptionExample,
    filter: MultiselectFilterExample,
    controls: MultiselectControlsExample,
    appendToBody: MultiselectAppendToBodyExample,
    virtualize: MultiselectVirtualizeExample,
    floatLabel: MultiselectFloatLabelExample,
    forms: MultiselectFormsExample,
    config: MultiselectConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { MultiselectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [MultiselectComponent],\n})\n```";
}
