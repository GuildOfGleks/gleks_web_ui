import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { CHECKBOX_EXAMPLE_SOURCES } from '../../../examples/checkbox/sources.generated';
import { CheckboxCheckIconExample } from '../../../examples/checkbox/checkbox-check-icon/example';
import { CheckboxDisabledExample } from '../../../examples/checkbox/checkbox-disabled/example';
import { CheckboxFormExample } from '../../../examples/checkbox/checkbox-form/example';
import { CheckboxFullWidthExample } from '../../../examples/checkbox/checkbox-full-width/example';
import { CheckboxIndeterminateExample } from '../../../examples/checkbox/checkbox-indeterminate/example';
import { CheckboxNoLabelExample } from '../../../examples/checkbox/checkbox-no-label/example';
import { CheckboxOverviewExample } from '../../../examples/checkbox/checkbox-overview/example';
import { CheckboxSizesExample } from '../../../examples/checkbox/checkbox-sizes/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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
    description: 'Box, label, and check-icon size.',
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
  {
    name: 'checkIconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Deprecated since 21.3.0, removed in 21.5.0 — project an <ng-template gogCheckboxIcon> instead. Still works, and the projected slot wins when both are present.',
  },
];

@Component({
  selector: 'app-checkbox-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, ReactiveFormsModule],
  providers: [provideExampleSources(CHECKBOX_EXAMPLE_SOURCES)],
  templateUrl: './checkbox-doc-page.html',
  styleUrl: './checkbox-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'checkbox')?.tokens ?? [];

  protected readonly formControl = new FormControl(false, { nonNullable: true });

  protected readonly importSnippet =
    "```typescript\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CheckboxComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/checkbox/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    checkIcon: CheckboxCheckIconExample,
    disabled: CheckboxDisabledExample,
    form: CheckboxFormExample,
    fullWidth: CheckboxFullWidthExample,
    indeterminate: CheckboxIndeterminateExample,
    noLabel: CheckboxNoLabelExample,
    overview: CheckboxOverviewExample,
    sizes: CheckboxSizesExample,
  };
}
