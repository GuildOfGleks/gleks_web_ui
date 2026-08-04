import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize, InputfieldComponent } from '@guildofgleks/ui';
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
    name: 'type',
    type: "'text' | 'password' | 'email'",
    default: "'text'",
    description: 'Native input type. password gets a built-in show/hide toggle for free.',
  },
  {
    name: 'autocomplete',
    type: 'string',
    default: "''",
    description: "Forwarded to the native input. Defaults to 'current-password' for password fields, 'off' otherwise, when left empty.",
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
    description: 'id on the native input, and target of the label\'s for attribute.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the native input.' },
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
    type: 'GogIconName | \'\'',
    default: "''",
    description: 'Leading / trailing icon name.',
  },
  {
    name: 'iconStartTemplate / iconEndTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Custom leading / trailing icon, in place of iconStart / iconEnd.',
  },
  {
    name: 'iconStartFn / iconEndFn',
    type: '(() => void) | null',
    default: 'null',
    description: 'When set, the icon becomes a clickable button invoking this function.',
  },
  {
    name: 'iconStartLabel / iconEndLabel',
    type: 'string',
    default: "''",
    description: 'Accessible label for the icon button — required when the matching *Fn is set.',
  },
  {
    name: 'showPasswordLabel / hidePasswordLabel',
    type: 'string',
    default: "'Show password' / 'Hide password'",
    description: 'Accessible labels for the built-in password reveal toggle.',
  },
];

@Component({
  selector: 'app-inputfield-doc-page',
  imports: [InputfieldComponent, MarkdownComponent, CodeTabsComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './inputfield-doc-page.html',
  styleUrl: './inputfield-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'input-field')?.tokens ?? [];

  protected readonly name = signal('');
  protected readonly password = signal('');
  protected readonly search = signal('');
  protected readonly manualErrorValue = signal('');
  protected readonly lastIconAction = signal('No icon action yet.');

  protected readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly importSnippet =
    "```typescript\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [InputfieldComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-inputfield label="Name" placeholder="Ada Lovelace" [(value)]="name" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `<gog-inputfield label="Name" placeholder="Ada Lovelace" [(value)]="name" />`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly name = signal('');",
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-inputfield [size]="sizeOption" [label]="sizeOption" [placeholder]="sizeOption" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-inputfield [size]="sizeOption" [label]="sizeOption" [placeholder]="sizeOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly passwordHtml =
    '<gog-inputfield label="Password" type="password" [(value)]="password" />';
  protected readonly passwordTs = [
    "import { Component, signal } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `<gog-inputfield label="Password" type="password" [(value)]="password" />`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly password = signal('');",
    '}',
  ].join('\n');

  protected readonly iconsHtml = [
    '<gog-inputfield label="Search" iconStart="info" placeholder="Decorative start icon" />',
    '',
    '<gog-inputfield',
    '  label="Clearable"',
    '  iconEnd="close"',
    '  iconEndLabel="Clear"',
    '  [iconEndFn]="clearSearch"',
    '  [(value)]="search"',
    '/>',
  ].join('\n');
  protected readonly iconsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `',
    '    <gog-inputfield label="Search" iconStart="info" placeholder="Decorative start icon" />',
    '',
    '    <gog-inputfield',
    '      label="Clearable"',
    '      iconEnd="close"',
    '      iconEndLabel="Clear"',
    '      [iconEndFn]="clearSearch"',
    '      [(value)]="search"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly search = signal('');",
    '',
    '  protected clearSearch = (): void => {',
    "    this.search.set('');",
    '  };',
    '}',
  ].join('\n');

  protected readonly errorHtml = [
    '<gog-inputfield',
    '  label="Username"',
    '  [(value)]="manualErrorValue"',
    '  [errorMessage]="manualErrorValue().length > 0 && manualErrorValue().length < 3 ? \'At least 3 characters\' : \'\'"',
    '/>',
  ].join('\n');
  protected readonly errorTs = [
    "import { Component, signal } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `',
    '    <gog-inputfield',
    '      label="Username"',
    '      [(value)]="value"',
    '      [errorMessage]="value().length > 0 && value().length < 3 ? \'At least 3 characters\' : \'\'"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly value = signal('');",
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<gog-inputfield',
    '  label="Email"',
    '  [formControl]="emailControl"',
    '  errorMessage="Enter a valid email"',
    '  errorDisplay="auto"',
    '/>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent, ReactiveFormsModule],',
    '  template: `',
    '    <gog-inputfield',
    '      label="Email"',
    '      [formControl]="emailControl"',
    '      errorMessage="Enter a valid email"',
    '      errorDisplay="auto"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly emailControl = new FormControl(\'\', {',
    '    nonNullable: true,',
    '    validators: [Validators.required, Validators.email],',
    '  });',
    '}',
  ].join('\n');

  protected readonly disabledHtml = '<gog-inputfield label="Disabled" [disabled]="true" value="Read only" />';
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `<gog-inputfield label="Disabled" [disabled]="true" value="Read only" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly autoWidthHtml = '<gog-inputfield label="Zip code" [fullWidth]="false" placeholder="00000" />';
  protected readonly autoWidthTs = [
    "import { Component } from '@angular/core';",
    "import { InputfieldComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [InputfieldComponent],',
    '  template: `<gog-inputfield label="Zip code" [fullWidth]="false" placeholder="00000" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected clearSearch = (): void => {
    this.search.set('');
    this.lastIconAction.set('Search cleared');
  };
}
