import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TEXTAREA_EXAMPLE_SOURCES } from '../../../examples/textarea/sources.generated';
import { TextareaAutoWidthExample } from '../../../examples/textarea/textarea-auto-width/example';
import { TextareaClearableExample } from '../../../examples/textarea/textarea-clearable/example';
import { TextareaDisabledExample } from '../../../examples/textarea/textarea-disabled/example';
import { TextareaErrorExample } from '../../../examples/textarea/textarea-error/example';
import { TextareaFloatLabelExample } from '../../../examples/textarea/textarea-float-label/example';
import { TextareaFormExample } from '../../../examples/textarea/textarea-form/example';
import { TextareaOverviewExample } from '../../../examples/textarea/textarea-overview/example';
import { TextareaResizeExample } from '../../../examples/textarea/textarea-resize/example';
import { TextareaRowsExample } from '../../../examples/textarea/textarea-rows/example';
import { TextareaSizesExample } from '../../../examples/textarea/textarea-sizes/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'resize',
    type: "'vertical' | 'horizontal' | 'both' | 'none' | undefined",
    default: 'undefined',
    description:
      "Which direction(s) the field's own drag handle resizes it in — the native CSS resize value space, with 'none' removing the handle entirely. Unset, falls back to GOG_CONFIG.textarea.resize, then to 'vertical'.",
    since: '21.3.1',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description:
      'Blocks edits while keeping the value focusable, selectable and submitted with the form. Also hides the clear button.',
    since: '21.3.2',
  },
  {
    name: 'maxlength',
    type: 'number | null',
    default: 'null',
    description: 'Native maxlength attribute.',
    since: '21.3.2',
  },
  {
    name: 'minlength',
    type: 'number | null',
    default: 'null',
    description: 'Native minlength attribute.',
    since: '21.3.2',
  },
  {
    name: 'spellcheck',
    type: 'boolean | null',
    default: 'null',
    description: "Native spellcheck attribute. Unset leaves the browser's own default in place.",
    since: '21.3.2',
  },
  {
    name: 'value',
    type: 'string (model)',
    default: "''",
    description:
      'Two-way bindable value via [(value)]. Also the value Angular Forms drives through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  { name: 'placeholder', type: 'string', default: "''", description: 'Native placeholder text.' },
  {
    name: 'rows',
    type: 'number',
    default: '4',
    description: "Native rows attribute, controlling the field's initial height.",
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
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one. Settable app-wide, which is what makes 'auto' one decision for a Reactive Forms app rather than per-field boilerplate.",
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'GOG_CONFIG.control.clearable ?? false',
    description:
      'Adds a clear button. It appears only once the field has something to clear and disappears again when empty, so it adds no permanent chrome.',
  },
  {
    name: 'clearAriaLabel',
    type: 'string',
    default: "'Clear'",
    description: 'Accessible name for that clear button.',
  },
  {
    name: 'floatLabel',
    type: "'none' | 'in' | 'on' | 'over'",
    default: "GOG_CONFIG.floatLabel.variant ?? 'none'",
    description:
      "Rests the label inside the field like a placeholder and floats it up on focus or once the field has content. 'in' stays inside the border, 'on' centres on the top border line, 'over' floats fully above it. 'none' keeps the static label-above-the-field layout.",
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description:
      'Reveals the field’s own placeholder once the label has floated out of the way. Off by default, since the resting label already occupies that space.',
  },
  { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: "id on the native textarea, and target of the label's for attribute.",
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the native textarea.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Field padding and font size — shares the scale with gog-inputfield.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description: 'Fills its container by default. Set false to shrink to content width instead.',
  },
];

@Component({
  selector: 'app-textarea-doc-page',
  imports: [
    ExampleHostComponent,
    MarkdownComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
  ],
  providers: [provideExampleSources(TEXTAREA_EXAMPLE_SOURCES)],
  templateUrl: './textarea-doc-page.html',
  styleUrl: './textarea-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  // gog-textarea paints with the same --gog-input-* tokens as gog-inputfield — no separate section.
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'input-field')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TextareaComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/textarea/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    autoWidth: TextareaAutoWidthExample,
    clearable: TextareaClearableExample,
    disabled: TextareaDisabledExample,
    error: TextareaErrorExample,
    floatLabel: TextareaFloatLabelExample,
    form: TextareaFormExample,
    overview: TextareaOverviewExample,
    resize: TextareaResizeExample,
    rows: TextareaRowsExample,
    sizes: TextareaSizesExample,
  };
}
