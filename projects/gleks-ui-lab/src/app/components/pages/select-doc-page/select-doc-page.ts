import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { SELECT_EXAMPLES } from '../../../examples/select/sources.generated';
import { SelectAccessorsExample } from '../../../examples/select/select-accessors/example';
import { SelectAppendToBodyExample } from '../../../examples/select/select-append-to-body/example';
import { SelectClearableExample } from '../../../examples/select/select-clearable/example';
import { SelectConfigExample } from '../../../examples/select/select-config/example';
import { SelectDirectionExample } from '../../../examples/select/select-direction/example';
import { SelectDisabledOptionExample } from '../../../examples/select/select-disabled-option/example';
import { SelectFilterExample } from '../../../examples/select/select-filter/example';
import { SelectFloatLabelExample } from '../../../examples/select/select-float-label/example';
import { SelectFormsExample } from '../../../examples/select/select-forms/example';
import { SelectOverviewExample } from '../../../examples/select/select-overview/example';
import { SelectSizesExample } from '../../../examples/select/select-sizes/example';
import { SelectSlotsExample } from '../../../examples/select/select-slots/example';
import { SelectStatesExample } from '../../../examples/select/select-states/example';
import { SelectVirtualizeExample } from '../../../examples/select/select-virtualize/example';
import { SelectWidthExample } from '../../../examples/select/select-width/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'TValue | null (model)',
    default: 'null',
    description:
      'Two-way bindable via [(value)]: the selected option run through optionValue — its id by default, the object itself with [optionValue]="null". Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the field when there is no visible label.',
  },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: "id on the trigger button, and target of the label's for attribute.",
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
      'How an option turns into its visible text: a property path (dot-paths included, "profile.fullName") or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into the emitted value. Set it to null and the control emits the option OBJECT itself — the same reference you passed in.',
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
    default: 'GOG_CONFIG.control.clearable ?? false',
    description:
      'Adds a clear button in the outermost trailing position, with the chevron shifting inward when it appears. It shows only once something is selected — which is what removes the need for a fake "— not selected —" option just to make a choice undoable.',
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
      'Puts a search box in the panel, matching case-insensitively on the resolved optionLabel. The query resets when the panel closes.',
  },
  {
    name: 'filterPosition',
    type: "'top' | 'bottom'",
    default: "GOG_CONFIG.dropdown.filterPosition ?? 'top'",
    description:
      'Which end of the panel the search box sticks to. It carries a divider on the side facing the list, so it reads as chrome rather than as a row.',
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
    description:
      'Replaces the default case-insensitive substring match — for searching a field the label does not show, or for fuzzy matching.',
  },
  {
    name: 'floatLabel',
    type: "'none' | 'in' | 'on' | 'over'",
    default: "GOG_CONFIG.floatLabel.variant ?? 'none'",
    description:
      'Rests the label inside the field like a placeholder and floats it up once something is selected or the field has focus.',
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description: 'Reveals the placeholder once the label has floated out of the way.',
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
      'Fills its container by default. Set false to shrink to fit the selected label instead.',
  },
  {
    name: 'minWidth',
    type: 'string | null',
    default: 'null (--gog-select-min-width, 120px)',
    description:
      'Floor for an auto-width trigger, any CSS length — so a short selection cannot collapse the field to its own chrome.',
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
      "Portals the panel into document.body instead of rendering it inline — escapes an ancestor's scroll/overflow clipping. Worth setting app-wide for a layout whose dropdowns generally live inside scrollable containers.",
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
    type: 'TValue | null',
    description:
      'Emitted when the selection changes — a pick, the clear button, or a forms write. Comes from the value model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogDropdownOption',
    type: '$implicit, selected, disabled, label',
    description:
      'Replaces one option row. label is the resolved label, so a custom row can decorate it rather than re-derive it.',
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
];

@Component({
  selector: 'app-select-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './select-doc-page.html',
  styleUrl: './select-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'select')?.tokens ?? [];

  protected readonly sources = SELECT_EXAMPLES;
  protected readonly examples = {
    overview: SelectOverviewExample,
    sizes: SelectSizesExample,
    states: SelectStatesExample,
    clearable: SelectClearableExample,
    width: SelectWidthExample,
    slots: SelectSlotsExample,
    accessors: SelectAccessorsExample,
    disabledOption: SelectDisabledOptionExample,
    filter: SelectFilterExample,
    direction: SelectDirectionExample,
    appendToBody: SelectAppendToBodyExample,
    virtualize: SelectVirtualizeExample,
    floatLabel: SelectFloatLabelExample,
    forms: SelectFormsExample,
    config: SelectConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SelectComponent],\n})\n```";
}
