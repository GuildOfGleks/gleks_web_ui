import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { INPUTFIELD_EXAMPLES } from '../../../examples/inputfield/sources.generated';
import { InputfieldAddonsExample } from '../../../examples/inputfield/inputfield-addons/example';
import { InputfieldClearableExample } from '../../../examples/inputfield/inputfield-clearable/example';
import { InputfieldConfigExample } from '../../../examples/inputfield/inputfield-config/example';
import { InputfieldErrorExample } from '../../../examples/inputfield/inputfield-error/example';
import { InputfieldFloatLabelExample } from '../../../examples/inputfield/inputfield-float-label/example';
import { InputfieldFormsExample } from '../../../examples/inputfield/inputfield-forms/example';
import { InputfieldIconsExample } from '../../../examples/inputfield/inputfield-icons/example';
import { InputfieldNumberDateExample } from '../../../examples/inputfield/inputfield-number-date/example';
import { InputfieldNumberEndExample } from '../../../examples/inputfield/inputfield-number-end/example';
import { InputfieldOverviewExample } from '../../../examples/inputfield/inputfield-overview/example';
import { InputfieldPasswordExample } from '../../../examples/inputfield/inputfield-password/example';
import { InputfieldSizesExample } from '../../../examples/inputfield/inputfield-sizes/example';
import { InputfieldStatesExample } from '../../../examples/inputfield/inputfield-states/example';
import { InputfieldStepperExample } from '../../../examples/inputfield/inputfield-stepper/example';
import { InputfieldTypesExample } from '../../../examples/inputfield/inputfield-types/example';
import { InputfieldWidthExample } from '../../../examples/inputfield/inputfield-width/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'showSpinButtons',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Whether a type="number" field shows the library\'s own +/- glyphs in place of the browser\'s native ones. Off, the field still steps with the arrow keys and the mouse wheel — that is native behaviour, unrelated to which glyphs are visible. Unset, falls back to GOG_CONFIG.inputfield.showSpinButtons, then to true.',
    since: '21.3.1',
  },
  {
    name: 'incrementLabel / decrementLabel',
    type: 'string | undefined',
    default: "'Increment' / 'Decrement'",
    description: 'Accessible names for the two spin buttons. Also via GOG_CONFIG.labels.',
    since: '21.3.1',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description:
      'Blocks edits while keeping the value focusable, selectable and submitted with the form. Hides both the clear button and the stepper.',
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
    name: 'pattern',
    type: 'string',
    default: "''",
    description: 'Native pattern attribute — a regular expression source, not a literal.',
    since: '21.3.2',
  },
  {
    name: 'inputMode',
    type: 'GogInputMode | null',
    default: 'null',
    description:
      "On-screen keyboard hint ('numeric', 'tel', 'decimal', …). Worth setting on a numeric field so a phone offers the right keypad.",
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
      'Two-way bindable value via [(value)]. Always a string — even for type="number" — since it mirrors the native input\'s raw text. Also the value Angular Forms drives through writeValue/registerOnChange when used with formControlName/[formControl]/ngModel; there, a number field\'s value is a number (null when empty) instead.',
  },
  { name: 'label', type: 'string', default: "''", description: 'Field label.' },
  { name: 'placeholder', type: 'string', default: "''", description: 'Native placeholder text.' },
  {
    name: 'type',
    type: "'text' | 'password' | 'email' | 'number' | 'date'",
    default: "'text'",
    description: 'Native input type. password gets a built-in show/hide toggle for free.',
  },
  {
    name: 'min / max / step',
    type: 'number | null',
    default: 'null',
    description:
      'Only applied when type="number" — forwarded to the native min/max/step attributes.',
  },
  {
    name: 'autocomplete',
    type: 'string',
    default: "''",
    description:
      "Forwarded to the native input. Defaults to 'current-password' for password fields, 'off' otherwise, when left empty.",
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
    default: "'manual'",
    description:
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one.",
  },
  { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: "id on the native input, and target of the label's for attribute.",
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the native input.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Field height, padding, and font size.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description: 'Fills its container by default. Set false to shrink to content width instead.',
  },
  {
    name: 'iconStart / iconEnd',
    type: "GogIconName | ''",
    default: "''",
    description: 'Leading / trailing icon name.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'GOG_CONFIG.control.clearable ?? false',
    description:
      'Adds a clear button. It appears only once the field has something to clear and disappears again when empty, so it adds no permanent chrome. On a password field the built-in reveal toggle keeps the trailing slot.',
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
      "Rests the label inside the field like a placeholder and floats it up on focus or once the field has content. 'in' stays inside the border, 'on' centres on the top border line, 'over' floats fully above it.",
  },
  {
    name: 'floatLabelShowPlaceholder',
    type: 'boolean',
    default: 'GOG_CONFIG.floatLabel.showPlaceholder ?? false',
    description:
      'Reveals the field’s own placeholder once the label has floated out of the way. Off by default, since the resting label already occupies that space.',
  },
  {
    name: 'showPasswordLabel / hidePasswordLabel',
    type: 'string',
    default: "'Show password' / 'Hide password'",
    description: 'Accessible labels for the built-in password reveal toggle.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'string',
    description: 'Emitted on every edit. Comes from the value model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: '[gogInputAddonStart]',
    type: '—',
    description: 'Arbitrary markup in the leading slot — text, an icon, or a real button.',
  },
  {
    name: '[gogInputAddonEnd]',
    type: '—',
    description:
      'The same in the trailing slot. On type="password" and type="number" it renders beside the reveal toggle or the stepper, which keep the outer edge. The clear button, while it shows, outranks it.',
  },
];

@Component({
  selector: 'app-inputfield-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './inputfield-doc-page.html',
  styleUrl: './inputfield-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'input-field')?.tokens ?? [];

  protected readonly sources = INPUTFIELD_EXAMPLES;
  protected readonly examples = {
    overview: InputfieldOverviewExample,
    sizes: InputfieldSizesExample,
    states: InputfieldStatesExample,
    types: InputfieldTypesExample,
    icons: InputfieldIconsExample,
    addons: InputfieldAddonsExample,
    clearable: InputfieldClearableExample,
    password: InputfieldPasswordExample,
    stepper: InputfieldStepperExample,
    numberEnd: InputfieldNumberEndExample,
    numberDate: InputfieldNumberDateExample,
    floatLabel: InputfieldFloatLabelExample,
    error: InputfieldErrorExample,
    forms: InputfieldFormsExample,
    width: InputfieldWidthExample,
    config: InputfieldConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [InputfieldComponent],\n})\n```";
}
