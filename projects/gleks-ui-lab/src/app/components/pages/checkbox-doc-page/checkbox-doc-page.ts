import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CheckboxComponent,
  GogCheckboxIconDirective,
  GogSize,
  IconComponent,
} from '@guildofgleks/ui';
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
    default: "'md'",
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
  imports: [
    CheckboxComponent,
    GogCheckboxIconDirective,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './checkbox-doc-page.html',
  styleUrl: './checkbox-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'checkbox')?.tokens ?? [];

  protected readonly agreed = signal(false);

  protected readonly subscriptions = signal([
    { id: 'news', label: 'Newsletter', checked: true },
    { id: 'offers', label: 'Special offers', checked: false },
    { id: 'updates', label: 'Product updates', checked: true },
  ]);
  protected readonly allChecked = computed(() =>
    this.subscriptions().every((item) => item.checked),
  );
  protected readonly someChecked = computed(() =>
    this.subscriptions().some((item) => item.checked),
  );
  protected readonly parentIndeterminate = computed(() => this.someChecked() && !this.allChecked());

  protected readonly formControl = new FormControl(false, { nonNullable: true });

  protected readonly importSnippet =
    "```typescript\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CheckboxComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-checkbox label="I agree" [(checked)]="agreed" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `<gog-checkbox label="I agree" [(checked)]="agreed" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly agreed = signal(false);',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-checkbox [size]="sizeOption" [label]="sizeOption" [checked]="true" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { CheckboxComponent, GogSize } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-checkbox [size]="sizeOption" [label]="sizeOption" [checked]="true" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly indeterminateHtml = [
    '<gog-checkbox',
    '  label="Select all"',
    '  [checked]="allChecked()"',
    '  [indeterminate]="someChecked() && !allChecked()"',
    '  (checkedChange)="setAll($event)"',
    '/>',
    '',
    '@for (item of subscriptions(); track item.id) {',
    '  <gog-checkbox',
    '    [label]="item.label"',
    '    [checked]="item.checked"',
    '    (checkedChange)="setOne(item.id, $event)"',
    '  />',
    '}',
  ].join('\n');
  protected readonly indeterminateTs = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    'interface Subscription {',
    '  id: string;',
    '  label: string;',
    '  checked: boolean;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `',
    '    <gog-checkbox',
    '      label="Select all"',
    '      [checked]="allChecked()"',
    '      [indeterminate]="someChecked() && !allChecked()"',
    '      (checkedChange)="setAll($event)"',
    '    />',
    '',
    '    @for (item of subscriptions(); track item.id) {',
    '      <gog-checkbox',
    '        [label]="item.label"',
    '        [checked]="item.checked"',
    '        (checkedChange)="setOne(item.id, $event)"',
    '      />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly subscriptions = signal<Subscription[]>([',
    "    { id: 'news', label: 'Newsletter', checked: true },",
    "    { id: 'offers', label: 'Special offers', checked: false },",
    '  ]);',
    '  protected readonly allChecked = computed(() =>',
    '    this.subscriptions().every((item) => item.checked),',
    '  );',
    '  protected readonly someChecked = computed(() =>',
    '    this.subscriptions().some((item) => item.checked),',
    '  );',
    '',
    '  protected setAll(checked: boolean): void {',
    '    this.subscriptions.update((items) => items.map((item) => ({ ...item, checked })));',
    '  }',
    '',
    '  protected setOne(id: string, checked: boolean): void {',
    '    this.subscriptions.update((items) =>',
    '      items.map((item) => (item.id === id ? { ...item, checked } : item)),',
    '    );',
    '  }',
    '}',
  ].join('\n');

  protected readonly disabledHtml = [
    '<gog-checkbox label="Disabled, unchecked" [disabled]="true" />',
    '<gog-checkbox label="Disabled, checked" [checked]="true" [disabled]="true" />',
    '<gog-checkbox label="Disabled, indeterminate" [indeterminate]="true" [disabled]="true" />',
  ].join('\n');
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `',
    '    <gog-checkbox label="Disabled, unchecked" [disabled]="true" />',
    '    <gog-checkbox label="Disabled, checked" [checked]="true" [disabled]="true" />',
    '    <gog-checkbox label="Disabled, indeterminate" [indeterminate]="true" [disabled]="true" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly noLabelHtml = '<gog-checkbox ariaLabel="Select row" [(checked)]="agreed" />';
  protected readonly noLabelTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `<gog-checkbox ariaLabel="Select row" [(checked)]="agreed" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly agreed = signal(false);',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml = '<gog-checkbox label="Full width row" [fullWidth]="true" />';
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent],',
    '  template: `<gog-checkbox label="Full width row" [fullWidth]="true" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly formHtml = '<gog-checkbox label="Subscribe" [formControl]="control" />';
  protected readonly formTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule } from '@angular/forms';",
    "import { CheckboxComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent, ReactiveFormsModule],',
    '  template: `<gog-checkbox label="Subscribe" [formControl]="control" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly control = new FormControl(false, { nonNullable: true });',
    '}',
  ].join('\n');

  protected readonly checkIconHtml = [
    '<gog-checkbox label="Custom mark" [checked]="true">',
    '  <ng-template gogCheckboxIcon>',
    '    <gog-icon name="close" />',
    '  </ng-template>',
    '</gog-checkbox>',
  ].join('\n');
  protected readonly checkIconTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  CheckboxComponent,',
    '  GogCheckboxIconDirective,',
    '  IconComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],',
    '  template: `',
    '    <gog-checkbox label="Custom mark" [checked]="true">',
    '      <ng-template gogCheckboxIcon>',
    '        <gog-icon name="close" />',
    '      </ng-template>',
    '    </gog-checkbox>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected setAll(checked: boolean): void {
    this.subscriptions.update((items) => items.map((item) => ({ ...item, checked })));
  }

  protected setOne(id: string, checked: boolean): void {
    this.subscriptions.update((items) =>
      items.map((item) => (item.id === id ? { ...item, checked } : item)),
    );
  }
}
