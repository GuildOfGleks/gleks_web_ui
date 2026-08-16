import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogProgressbarVariant,
  GogSize,
  ProgressbarComponent,
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
    name: 'value',
    type: 'number',
    default: '0',
    description:
      'Percentage complete, 0–100. Clamped rather than trusted — a bar driven from loaded / total overshoots on the last chunk often enough to be worth handling here. Ignored in indeterminate mode.',
  },
  {
    name: 'buffer',
    type: 'number',
    default: '0',
    description:
      'Secondary level shown behind value in buffer mode — preloaded but not yet played. Also clamped to 0–100.',
  },
  {
    name: 'mode',
    type: "'determinate' | 'indeterminate' | 'buffer'",
    default: "'determinate'",
    description:
      'determinate reflects value; indeterminate is work of unknown length; buffer adds a second, lighter level ahead of the fill.',
  },
  {
    name: 'variant',
    type: "'accent' | 'success' | 'danger' | 'warning' | 'info'",
    default: "'accent'",
    description:
      'Fill color. Wider than the tag palette by one: progress is usually just "the app is working", which is the accent color rather than any status hue.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Bar thickness.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'false',
    description:
      'Renders the rounded percentage next to the bar. Off by default — most bars sit under a label that already says what is happening.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the bar.',
  },
];

@Component({
  selector: 'app-progressbar-doc-page',
  imports: [
    ProgressbarComponent,
    ButtonComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './progressbar-doc-page.html',
  styleUrl: './progressbar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarDocPage {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'success',
    'danger',
    'warning',
    'info',
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly uploaded = signal(42);

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'progressbar')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ProgressbarComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ProgressbarComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-progressbar [value]="42" ariaLabel="Upload progress" />';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { ProgressbarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ProgressbarComponent],',
    '  template: `<gog-progressbar [value]="42" ariaLabel="Upload progress" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly modesHtml = [
    '<gog-progressbar [value]="42" ariaLabel="Upload" />',
    '<gog-progressbar mode="indeterminate" ariaLabel="Loading" />',
    '<gog-progressbar mode="buffer" [value]="42" [buffer]="70" ariaLabel="Playback" />',
  ].join('\n');
  protected readonly modesTs = [
    "import { Component } from '@angular/core';",
    "import { ProgressbarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ProgressbarComponent],',
    '  template: `',
    '    <gog-progressbar [value]="42" ariaLabel="Upload" />',
    '    <gog-progressbar mode="indeterminate" ariaLabel="Loading" />',
    '    <gog-progressbar mode="buffer" [value]="42" [buffer]="70" ariaLabel="Playback" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly variantsHtml = [
    '@for (variantOption of variants; track variantOption) {',
    '  <gog-progressbar [variant]="variantOption" [value]="65" [ariaLabel]="variantOption" />',
    '}',
  ].join('\n');
  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ProgressbarComponent],',
    '  template: `',
    '    @for (variantOption of variants; track variantOption) {',
    '      <gog-progressbar [variant]="variantOption" [value]="65" [ariaLabel]="variantOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly variants: GogProgressbarVariant[] = [',
    "    'accent',",
    "    'success',",
    "    'danger',",
    "    'warning',",
    "    'info',",
    '  ];',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-progressbar [size]="sizeOption" [value]="65" [ariaLabel]="sizeOption" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, ProgressbarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ProgressbarComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-progressbar [size]="sizeOption" [value]="65" [ariaLabel]="sizeOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly showValueHtml = [
    '<gog-progressbar [value]="uploaded()" [showValue]="true" ariaLabel="Upload progress" />',
  ].join('\n');
  protected readonly showValueTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ProgressbarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ProgressbarComponent],',
    '  template: `',
    '    <gog-progressbar [value]="uploaded()" [showValue]="true" ariaLabel="Upload progress" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly uploaded = signal(42);',
    '}',
  ].join('\n');

  protected step(delta: number): void {
    this.uploaded.update((value) => Math.min(100, Math.max(0, value + delta)));
  }
}
