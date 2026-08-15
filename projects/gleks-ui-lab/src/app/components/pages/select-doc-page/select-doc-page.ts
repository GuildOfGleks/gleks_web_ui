import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { SELECT_EXAMPLE_SOURCES } from '../../../examples/select/sources.generated';
import { SelectAccessorsExample } from '../../../examples/select/select-accessors/example';
import { SelectAppendToBodyExample } from '../../../examples/select/select-append-to-body/example';
import { SelectChevronExample } from '../../../examples/select/select-chevron/example';
import { SelectClearableExample } from '../../../examples/select/select-clearable/example';
import { SelectFilterExample } from '../../../examples/select/select-filter/example';
import { SelectFormExample } from '../../../examples/select/select-form/example';
import { SelectFullWidthExample } from '../../../examples/select/select-full-width/example';
import { SelectOptionSlotExample } from '../../../examples/select/select-option-slot/example';
import { SelectOverviewExample } from '../../../examples/select/select-overview/example';
import { SelectSizesExample } from '../../../examples/select/select-sizes/example';
import { SelectStatesExample } from '../../../examples/select/select-states/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

/** A deliberately un-`GogDropdownOption`-shaped DTO, to show the accessors doing their job. */
interface User {
  readonly uuid: string;
  readonly profile: { readonly fullName: string; readonly role: string };
  readonly suspended: boolean;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'value',
    type: 'string | number | null (model)',
    default: 'null',
    description:
      'Two-way bindable selected option id via [(value)]. Also driven by Angular Forms through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
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
    name: 'chevronTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Deprecated since 21.3.0, removed in 21.5.0 — project an <ng-template gogDropdownChevron> instead. Still works, and the projected slot wins when both are present.',
  },
];

@Component({
  selector: 'app-select-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, ReactiveFormsModule],
  providers: [provideExampleSources(SELECT_EXAMPLE_SOURCES)],
  templateUrl: './select-doc-page.html',
  styleUrl: './select-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'select')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { SelectComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SelectComponent],\n})\n```";

  // ---- 21.3.0: option accessors, filtering, clearable, option slot -------------------------

  protected readonly userId = signal<string | number | null>(null);
  protected readonly userObject = signal<User | null>(null);
  /** Each example is a file under `src/app/examples/select/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    accessors: SelectAccessorsExample,
    appendToBody: SelectAppendToBodyExample,
    chevron: SelectChevronExample,
    clearable: SelectClearableExample,
    filter: SelectFilterExample,
    form: SelectFormExample,
    fullWidth: SelectFullWidthExample,
    optionSlot: SelectOptionSlotExample,
    overview: SelectOverviewExample,
    sizes: SelectSizesExample,
    states: SelectStatesExample,
  };
}
