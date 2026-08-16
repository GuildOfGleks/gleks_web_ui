import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GogSize, ToggleComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean',
    default: 'false',
    description:
      'The on/off state. Two-way bindable with [(checked)]. Drive this or a form directive, never both.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description: 'Visible text label rendered next to the switch, inside the same <label>.',
  },
  {
    name: 'labelPosition',
    type: "'start' | 'end'",
    default: "'end'",
    description: 'Which side of the switch the label sits on.',
  },
  {
    name: 'onLabel / offLabel',
    type: 'string',
    default: "''",
    description:
      'Short text rendered inside the track — the one thing a checkbox cannot do. Both stay in the DOM so the track width cannot jump as it flips; it sizes to the wider of the two.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name, used when there is no visible label.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Track, thumb and label scale. Shares gog-checkbox’s size steps.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Blocks interaction. A form control’s own disabled state is honoured too.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description:
      'Stretches the row to fill its container, pushing the switch and the label apart — the usual settings-list layout.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'checkedChange',
    type: 'boolean',
    default: '—',
    description: 'Emitted when the user flips the switch. Comes from the checked model input.',
  },
];

@Component({
  selector: 'app-toggle-doc-page',
  imports: [ToggleComponent, ReactiveFormsModule, MarkdownComponent, CodeTabsComponent, RouterLink],
  templateUrl: './toggle-doc-page.html',
  styleUrl: './toggle-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly notifications = signal(true);
  protected readonly analytics = signal(false);
  protected readonly compactMode = signal(false);
  protected readonly labelStart = signal(true);
  protected readonly sizeState = signal(true);
  protected readonly darkMode = new FormControl(true);

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'toggle')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ToggleComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-toggle label="Notifications" [(checked)]="notifications" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent],',
    '  template: `<gog-toggle label="Notifications" [(checked)]="notifications" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly notifications = signal(true);',
    '}',
  ].join('\n');

  protected readonly trackLabelsHtml = [
    '<gog-toggle label="Analytics" onLabel="ON" offLabel="OFF" [(checked)]="analytics" />',
  ].join('\n');
  protected readonly trackLabelsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent],',
    '  template: `',
    '    <gog-toggle label="Analytics" onLabel="ON" offLabel="OFF" [(checked)]="analytics" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly analytics = signal(false);',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-toggle [size]="sizeOption" [label]="sizeOption" [(checked)]="sizeState" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogSize, ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-toggle [size]="sizeOption" [label]="sizeOption" [(checked)]="sizeState" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '  protected readonly sizeState = signal(true);',
    '}',
  ].join('\n');

  protected readonly layoutHtml = [
    '<gog-toggle label="Label after the switch" [(checked)]="compactMode" />',
    '<gog-toggle label="Label before it" labelPosition="start" [(checked)]="labelStart" />',
    '',
    '<!-- The settings-row layout: the switch is pushed to the far edge. -->',
    '<gog-toggle label="Full width" [fullWidth]="true" [(checked)]="compactMode" />',
  ].join('\n');
  protected readonly layoutTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent],',
    '  template: `',
    '    <gog-toggle label="Label after the switch" [(checked)]="compactMode" />',
    '    <gog-toggle label="Label before it" labelPosition="start" [(checked)]="labelStart" />',
    '    <gog-toggle label="Full width" [fullWidth]="true" [(checked)]="compactMode" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly compactMode = signal(false);',
    '  protected readonly labelStart = signal(true);',
    '}',
  ].join('\n');

  protected readonly formsHtml = '<gog-toggle label="Dark mode" [formControl]="darkMode" />';
  protected readonly formsTs = [
    "import { Component } from '@angular/core';",
    "import { FormControl, ReactiveFormsModule } from '@angular/forms';",
    "import { ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent, ReactiveFormsModule],',
    '  template: `<gog-toggle label="Dark mode" [formControl]="darkMode" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly darkMode = new FormControl(true);',
    '}',
  ].join('\n');

  protected readonly disabledHtml = [
    '<gog-toggle label="Disabled, off" [disabled]="true" />',
    '<gog-toggle label="Disabled, on" [disabled]="true" [checked]="true" />',
  ].join('\n');
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { ToggleComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ToggleComponent],',
    '  template: `',
    '    <gog-toggle label="Disabled, off" [disabled]="true" />',
    '    <gog-toggle label="Disabled, on" [disabled]="true" [checked]="true" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
}
