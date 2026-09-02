import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChipComponent, GogSize, GogTagShape } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
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
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Font size, padding, gap, and avatar/icon size.',
  },
  {
    name: 'shape',
    type: "'rounded' | 'pill'",
    default: "'rounded'",
    description: 'Corner radius style.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Blocks click/keyboard activation and hides the remove button, regardless of removable.',
  },
  {
    name: 'clickable',
    type: 'boolean',
    default: 'true',
    description:
      'Whether the chip responds to click/Enter/Space and exposes role="button". Set false for a static, non-interactive label.',
  },
  {
    name: 'removable',
    type: 'boolean',
    default: 'false',
    description: 'Shows a trailing remove (×) button that emits gogRemove.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the chip to fill its container.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the chip surface.',
  },
  {
    name: 'removeAriaLabel',
    type: 'string',
    default: "'Remove chip'",
    description: 'Accessible name for the remove button.',
  },
  {
    name: 'avatarUrl',
    type: 'string | null',
    default: 'null',
    description: 'Leading avatar image URL.',
  },
  {
    name: 'avatarAlt',
    type: 'string',
    default: "''",
    description: 'Alt text for the avatar image.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description:
      'Leading icon. Renders independently of avatarUrl — if both are set, the avatar and icon both render.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on the chip surface. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

interface ApiOutputRow {
  readonly name: string;
  readonly type: string;
  readonly description: string;
}

const API_OUTPUTS: readonly ApiOutputRow[] = [
  {
    name: 'gogClick',
    type: 'EventEmitter<MouseEvent | KeyboardEvent>',
    description: 'Emitted on click, Enter, or Space, when clickable and not disabled.',
  },
  {
    name: 'gogRemove',
    type: 'EventEmitter<void>',
    description:
      'Emitted when the remove button is pressed. Stops the click from also reaching gogClick.',
  },
];

@Component({
  selector: 'app-chip-doc-page',
  imports: [
    ChipComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './chip-doc-page.html',
  styleUrl: './chip-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'chip')?.tokens ?? [];

  protected readonly lastClicked = signal('No chip clicked yet.');

  protected readonly tags = signal([
    { id: 'angular', label: 'Angular' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'rxjs', label: 'RxJS' },
  ]);

  protected readonly importSnippet =
    "```typescript\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ChipComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-chip (gogClick)="onClick(\'Design\')">Design</gog-chip>';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `<gog-chip (gogClick)="onClick(\'Design\')">Design</gog-chip>`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly lastClicked = signal('No chip clicked yet.');",
    '',
    '  protected onClick(label: string): void {',
    '    this.lastClicked.set(`Clicked "${label}"`);',
    '  }',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-chip [size]="sizeOption">{{ sizeOption }}</gog-chip>',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent, GogSize } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-chip [size]="sizeOption">{{ sizeOption }}</gog-chip>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly shapesHtml = [
    '<gog-chip shape="rounded">Rounded</gog-chip>',
    '<gog-chip shape="pill">Pill</gog-chip>',
  ].join('\n');
  protected readonly shapesTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `',
    '    <gog-chip shape="rounded">Rounded</gog-chip>',
    '    <gog-chip shape="pill">Pill</gog-chip>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly removableHtml = [
    '@for (tag of tags(); track tag.id) {',
    '  <gog-chip [removable]="true" (gogRemove)="removeTag(tag.id)">{{ tag.label }}</gog-chip>',
    '}',
  ].join('\n');
  protected readonly removableTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    'interface Tag {',
    '  id: string;',
    '  label: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `',
    '    @for (tag of tags(); track tag.id) {',
    '      <gog-chip [removable]="true" (gogRemove)="removeTag(tag.id)">{{ tag.label }}</gog-chip>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly tags = signal<Tag[]>([',
    "    { id: 'angular', label: 'Angular' },",
    "    { id: 'typescript', label: 'TypeScript' },",
    '  ]);',
    '',
    '  protected removeTag(id: string): void {',
    '    this.tags.update((current) => current.filter((tag) => tag.id !== id));',
    '  }',
    '}',
  ].join('\n');

  protected readonly nonInteractiveHtml = '<gog-chip [clickable]="false">Read only</gog-chip>';
  protected readonly nonInteractiveTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `<gog-chip [clickable]="false">Read only</gog-chip>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly disabledHtml = '<gog-chip [disabled]="true">Disabled</gog-chip>';
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `<gog-chip [disabled]="true">Disabled</gog-chip>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly iconHtml = '<gog-chip iconName="info">Info</gog-chip>';
  protected readonly iconTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `<gog-chip iconName="info">Info</gog-chip>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly avatarHtml =
    '<gog-chip avatarUrl="https://i.pravatar.cc/64" avatarAlt="Jane Doe">Jane Doe</gog-chip>';
  protected readonly avatarTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `',
    '    <gog-chip avatarUrl="https://i.pravatar.cc/64" avatarAlt="Jane Doe">Jane Doe</gog-chip>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly fullWidthHtml = '<gog-chip [fullWidth]="true">Full width</gog-chip>';
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent],',
    '  template: `<gog-chip [fullWidth]="true">Full width</gog-chip>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected onClick(label: string): void {
    this.lastClicked.set(`Clicked "${label}"`);
  }

  protected removeTag(id: string): void {
    this.tags.update((current) => current.filter((tag) => tag.id !== id));
  }
}
