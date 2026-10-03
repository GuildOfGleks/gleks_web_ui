import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TEXTAREA_EXAMPLES } from '../../../examples/textarea/sources.generated';
import { TextareaClearableExample } from '../../../examples/textarea/textarea-clearable/example';
import { TextareaConfigExample } from '../../../examples/textarea/textarea-config/example';
import { TextareaFloatLabelExample } from '../../../examples/textarea/textarea-float-label/example';
import { TextareaFormsExample } from '../../../examples/textarea/textarea-forms/example';
import { TextareaManualErrorExample } from '../../../examples/textarea/textarea-manual-error/example';
import { TextareaNativeExample } from '../../../examples/textarea/textarea-native/example';
import { TextareaOverviewExample } from '../../../examples/textarea/textarea-overview/example';
import { TextareaResizeExample } from '../../../examples/textarea/textarea-resize/example';
import { TextareaRowsExample } from '../../../examples/textarea/textarea-rows/example';
import { TextareaSizesExample } from '../../../examples/textarea/textarea-sizes/example';
import { TextareaStatesExample } from '../../../examples/textarea/textarea-states/example';
import { TextareaWidthExample } from '../../../examples/textarea/textarea-width/example';

const API_INPUTS: readonly ApiRow[] = [
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
    default: "GOG_CONFIG.labels.clear ?? 'Clear'",
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

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'string',
    description:
      'Emitted on every edit, and by the clear button. Comes from the value model input.',
  },
];

@Component({
  selector: 'app-textarea-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './textarea-doc-page.html',
  styleUrl: './textarea-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  // gog-textarea paints with the same --gog-input-* tokens as gog-inputfield — no separate section.
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'input-field')?.tokens ?? [];

  protected readonly sources = TEXTAREA_EXAMPLES;
  protected readonly examples = {
    overview: TextareaOverviewExample,
    sizes: TextareaSizesExample,
    states: TextareaStatesExample,
    manualError: TextareaManualErrorExample,
    rows: TextareaRowsExample,
    resize: TextareaResizeExample,
    clearable: TextareaClearableExample,
    width: TextareaWidthExample,
    native: TextareaNativeExample,
    floatLabel: TextareaFloatLabelExample,
    forms: TextareaFormsExample,
    config: TextareaConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TextareaComponent],\n})\n```";
}
