import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GogIconName,
  GogSize,
  GogTagIconDirective,
  GogTagShape,
  GogTagVariant,
  IconComponent,
  TagComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
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
    name: 'variant',
    type: "'success' | 'danger' | 'warning' | 'info'",
    default: "'info'",
    description: 'Semantic color.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Font size, padding, gap, and icon size.',
  },
  {
    name: 'shape',
    type: "'rounded' | 'pill'",
    default: "'rounded'",
    description: 'Corner radius style.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description: 'Leading icon.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description:
      'By default the tag fits its text with no wrapping. Set true to stretch it to fill its container instead.',
  },
];

@Component({
  selector: 'app-tag-doc-page',
  imports: [
    TagComponent,
    IconComponent,
    GogTagIconDirective,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './tag-doc-page.html',
  styleUrl: './tag-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDocPage {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];
  protected readonly variantIcons: Record<GogTagVariant, GogIconName> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tag')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TagComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-tag variant="success" iconName="check">In stock</gog-tag>';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent],',
    '  template: `<gog-tag variant="success" iconName="check">In stock</gog-tag>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly variantsHtml = [
    '<gog-tag variant="success" iconName="check">Example</gog-tag>',
    '<gog-tag variant="danger" iconName="error">Example</gog-tag>',
    '<gog-tag variant="warning" iconName="warning">Example</gog-tag>',
    '<gog-tag variant="info" iconName="info">Example</gog-tag>',
  ].join('\n');
  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { GogTagVariant, TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent],',
    '  template: `',
    '    @for (variantOption of variants; track variantOption) {',
    '      <gog-tag [variant]="variantOption" [iconName]="variantIcons[variantOption]">',
    '        Example',
    '      </gog-tag>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];",
    '  protected readonly variantIcons: Record<GogTagVariant, string> = {',
    "    success: 'check',",
    "    danger: 'error',",
    "    warning: 'warning',",
    "    info: 'info',",
    '  };',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-tag [size]="sizeOption" variant="success">Available</gog-tag>',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-tag [size]="sizeOption" variant="success">Available</gog-tag>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly shapesHtml = [
    '<gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>',
    '<gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>',
  ].join('\n');
  protected readonly shapesTs = [
    "import { Component } from '@angular/core';",
    "import { TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent],',
    '  template: `',
    '    <gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>',
    '    <gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly customIconHtml = [
    '<gog-tag variant="success">',
    '  <ng-template gogTagIcon>',
    '    <gog-icon name="checkbox-checked" />',
    '  </ng-template>',
    '  Featured',
    '</gog-tag>',
  ].join('\n');
  protected readonly customIconTs = [
    "import { Component } from '@angular/core';",
    "import { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent, IconComponent, GogTagIconDirective],',
    '  template: `',
    '    <gog-tag variant="success">',
    '      <ng-template gogTagIcon>',
    '        <gog-icon name="checkbox-checked" />',
    '      </ng-template>',
    '      Featured',
    '    </gog-tag>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly fullWidthHtml =
    '<gog-tag variant="info" [fullWidth]="true">Full width</gog-tag>';
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TagComponent],',
    '  template: `<gog-tag variant="info" [fullWidth]="true">Full width</gog-tag>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
}
