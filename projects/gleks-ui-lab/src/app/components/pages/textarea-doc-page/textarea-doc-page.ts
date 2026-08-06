import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize, TextareaComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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
    default: "'manual'",
    description:
      "'manual': shown for as long as errorMessage is non-empty — you decide the timing. 'auto': shown once the attached FormControl is touched and invalid; falls back to manual without one.",
  },
  { name: 'name', type: 'string', default: "''", description: 'Native name attribute.' },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: "id on the native textarea, and target of the label's for attribute.",
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the native textarea.' },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
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
  imports: [TextareaComponent, MarkdownComponent, CodeTabsComponent, RouterLink, ReactiveFormsModule],
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
    '  [errorMessage]="manualErrorValue().length > 0 && manualErrorValue().length < 10 ? \'At least 10 characters\' : \'\'"',
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
    '      [errorMessage]="value().length > 0 && value().length < 10 ? \'At least 10 characters\' : \'\'"',
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
    '  protected readonly commentControl = new FormControl(\'\', {',
    '    nonNullable: true,',
    '    validators: [Validators.required, Validators.minLength(10)],',
    '  });',
    '}',
  ].join('\n');

  protected readonly disabledHtml = '<gog-textarea label="Disabled" [disabled]="true" value="Read only" />';
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

  protected readonly autoWidthHtml = '<gog-textarea label="Short note" [fullWidth]="false" [rows]="2" />';
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
}
