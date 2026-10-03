import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { CHECKBOX_EXAMPLES } from '../../../examples/checkbox/sources.generated';
import { CheckboxBindingExample } from '../../../examples/checkbox/checkbox-binding/example';
import { CheckboxConfigExample } from '../../../examples/checkbox/checkbox-config/example';
import { CheckboxFormsExample } from '../../../examples/checkbox/checkbox-forms/example';
import { CheckboxFullWidthExample } from '../../../examples/checkbox/checkbox-full-width/example';
import { CheckboxIconExample } from '../../../examples/checkbox/checkbox-icon/example';
import { CheckboxIndeterminateInputExample } from '../../../examples/checkbox/checkbox-indeterminate-input/example';
import { CheckboxLabelsExample } from '../../../examples/checkbox/checkbox-labels/example';
import { CheckboxOverviewExample } from '../../../examples/checkbox/checkbox-overview/example';
import { CheckboxSelectAllExample } from '../../../examples/checkbox/checkbox-select-all/example';
import { CheckboxStatesExample } from '../../../examples/checkbox/checkbox-states/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean (model)',
    default: 'false',
    description:
      "Two-way bindable checked state via [(checked)]. Also the state Angular Forms drives through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel — don't wire both to the same instance.",
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description:
      'Visible label rendered next to the box. Takes priority over ariaLabel when present.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description:
      'Accessible name used only when label is empty — falls back onto the native input.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description:
      'Box, label and check-icon size, from the --gog-control-checkbox-* scale gog-radio-group shares.',
  },
  {
    name: 'indeterminate',
    type: 'boolean',
    default: 'false',
    description:
      'Renders a dash instead of the checkmark and sets aria-checked="mixed", regardless of checked. Purely presentational — does not affect the underlying checked value.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Sets the native disabled attribute and blocks toggling. A FormControl.disable() has the same effect via setDisabledState.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the checkbox row to fill its container.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'checkedChange',
    type: 'boolean',
    description: 'Emitted when the box is toggled. Comes from the checked model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogCheckboxIcon',
    type: '—',
    description:
      'Replaces the checkmark drawn inside the box when checked. The indeterminate dash is not replaced.',
  },
];

@Component({
  selector: 'app-checkbox-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './checkbox-doc-page.html',
  styleUrl: './checkbox-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'checkbox')?.tokens ?? [];

  protected readonly sources = CHECKBOX_EXAMPLES;
  protected readonly examples = {
    overview: CheckboxOverviewExample,
    states: CheckboxStatesExample,
    labels: CheckboxLabelsExample,
    fullWidth: CheckboxFullWidthExample,
    icon: CheckboxIconExample,
    selectAll: CheckboxSelectAllExample,
    indeterminateInput: CheckboxIndeterminateInputExample,
    binding: CheckboxBindingExample,
    forms: CheckboxFormsExample,
    config: CheckboxConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CheckboxComponent],\n})\n```";
}
