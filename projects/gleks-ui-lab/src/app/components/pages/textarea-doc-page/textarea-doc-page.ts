import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize, TextareaComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

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
    TextareaComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
    SinceBadgeComponent,
  ],
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

  protected readonly resizeHtml = [
    '<gog-textarea label="Vertical (default)" [rows]="3" />',
    '<gog-textarea label="Both axes" resize="both" [rows]="3" />',
    '<gog-textarea label="Fixed size" resize="none" [rows]="3" />',
  ].join('\n');
  protected readonly resizeTs = [
    "import { Component } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `',
    '    <gog-textarea label="Both axes" resize="both" [rows]="3" />',
    '    <gog-textarea label="Fixed size" resize="none" [rows]="3" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly bio = signal('');
  protected readonly manualErrorValue = signal('');

  protected readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10)],
  });

  protected readonly importSnippet =
    "```typescript\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TextareaComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-textarea label="Bio" placeholder="Tell us about yourself" [(value)]="bio" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `<gog-textarea label="Bio" placeholder="Tell us about yourself" [(value)]="bio" />`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly bio = signal('');",
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-textarea [size]="sizeOption" [label]="sizeOption" [rows]="2" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-textarea [size]="sizeOption" [label]="sizeOption" [rows]="2" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly rowsHtml = '<gog-textarea label="Notes" [rows]="8" />';
  protected readonly rowsTs = [
    "import { Component } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `<gog-textarea label="Notes" [rows]="8" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly errorHtml = [
    '<gog-textarea',
    '  label="Feedback"',
    '  [(value)]="manualErrorValue"',
    "  [errorMessage]=\"manualErrorValue().length > 0 && manualErrorValue().length < 10 ? 'At least 10 characters' : ''\"",
    '/>',
  ].join('\n');
  protected readonly errorTs = [
    "import { Component, signal } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `',
    '    <gog-textarea',
    '      label="Feedback"',
    '      [(value)]="value"',
    "      [errorMessage]=\"value().length > 0 && value().length < 10 ? 'At least 10 characters' : ''\"",
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly value = signal('');",
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<gog-textarea',
    '  label="Comment"',
    '  [formControl]="commentControl"',
    '  errorMessage="At least 10 characters"',
    '  errorDisplay="auto"',
    '/>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-textarea',
    '      label="Comment"',
    '      [formControl]="commentControl"',
    '      errorMessage="At least 10 characters"',
    '      errorDisplay="auto"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly commentControl = new FormControl('', {",
    '    nonNullable: true,',
    '    validators: [Validators.required, Validators.minLength(10)],',
    '  });',
    '}',
  ].join('\n');

  protected readonly disabledHtml =
    '<gog-textarea label="Disabled" [disabled]="true" value="Read only" />';
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `<gog-textarea label="Disabled" [disabled]="true" value="Read only" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly autoWidthHtml =
    '<gog-textarea label="Short note" [fullWidth]="false" [rows]="2" />';
  protected readonly autoWidthTs = [
    "import { Component } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `<gog-textarea label="Short note" [fullWidth]="false" [rows]="2" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly clearableValue = signal('');
  protected readonly clearableHtml =
    '<gog-textarea label="Notes" [clearable]="true" [(value)]="notes" />';
  protected readonly clearableTs = [
    "import { Component, signal } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `<gog-textarea label="Notes" [clearable]="true" [(value)]="notes" />`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly notes = signal('');",
    '}',
  ].join('\n');

  protected readonly floatLabelHtml = [
    '<gog-textarea label="in" floatLabel="in" [rows]="2" />',
    '<gog-textarea label="on" floatLabel="on" [rows]="2" />',
    '<gog-textarea label="over" floatLabel="over" [rows]="2" />',
  ].join('\n');
  protected readonly floatLabelTs = [
    "import { Component } from '@angular/core';",
    "import { TextareaComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TextareaComponent],',
    '  template: `',
    '    <gog-textarea label="Message" floatLabel="on" [rows]="2" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
}
