import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DividerComponent, GogDividerVariant, IconComponent, TagComponent } from '@guildofgleks/ui';
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
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'Which way the rule runs. A vertical divider takes its length from --gog-divider-vertical-length unless its container stretches it.',
  },
  {
    name: 'variant',
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'solid'",
    description: 'How the line is painted.',
  },
  {
    name: 'inset',
    type: 'boolean',
    default: 'false',
    description:
      'Indents the rule from the leading edge by --gog-divider-inset-size, so it lines up with the text of a list whose rows start with an icon or avatar instead of cutting across the whole row.',
  },
];

@Component({
  selector: 'app-divider-doc-page',
  imports: [
    DividerComponent,
    IconComponent,
    TagComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './divider-doc-page.html',
  styleUrl: './divider-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerDocPage {
  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'divider')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { DividerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [DividerComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<p>Above the rule.</p>',
    '<gog-divider />',
    '<p>Below it.</p>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { DividerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [DividerComponent],',
    '  template: `',
    '    <p>Above the rule.</p>',
    '    <gog-divider />',
    '    <p>Below it.</p>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly variantsHtml = [
    '<gog-divider variant="solid" />',
    '<gog-divider variant="dashed" />',
    '<gog-divider variant="dotted" />',
  ].join('\n');
  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { DividerComponent, GogDividerVariant } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [DividerComponent],',
    '  template: `',
    '    @for (variantOption of variants; track variantOption) {',
    '      <gog-divider [variant]="variantOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly variants: GogDividerVariant[] = ['solid', 'dashed', 'dotted'];",
    '}',
  ].join('\n');

  protected readonly labelHtml = [
    '<gog-divider>OR</gog-divider>',
    '',
    '<!-- The label is projected content, so it takes markup, not just text. -->',
    '<gog-divider>',
    '  <gog-icon name="info" />',
    '  Shipping details',
    '</gog-divider>',
    '',
    '<gog-divider><gog-tag variant="warning">Draft</gog-tag></gog-divider>',
  ].join('\n');
  protected readonly labelTs = [
    "import { Component } from '@angular/core';",
    "import { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [DividerComponent, IconComponent, TagComponent],',
    '  template: `',
    '    <gog-divider>OR</gog-divider>',
    '',
    '    <gog-divider>',
    '      <gog-icon name="info" />',
    '      Shipping details',
    '    </gog-divider>',
    '',
    '    <gog-divider><gog-tag variant="warning">Draft</gog-tag></gog-divider>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly verticalHtml = [
    '<div class="toolbar">',
    '  <button>Cut</button>',
    '  <gog-divider orientation="vertical" />',
    '  <button>Copy</button>',
    '  <gog-divider orientation="vertical" />',
    '  <button>Paste</button>',
    '</div>',
  ].join('\n');
  protected readonly verticalTs = [
    "import { Component } from '@angular/core';",
    "import { DividerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [DividerComponent],',
    '  template: `',
    '    <div class="toolbar">',
    '      <button>Cut</button>',
    '      <gog-divider orientation="vertical" />',
    '      <button>Copy</button>',
    '    </div>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
  protected readonly verticalCss = [
    '.toolbar {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 12px;',
    '  /* A vertical divider stretches to the row when the row defines a height; without one',
    '     it falls back to --gog-divider-vertical-length. */',
    '  height: 32px;',
    '}',
  ].join('\n');

  protected readonly insetHtml = [
    '<ul class="event-list">',
    '  <li><gog-icon name="success" /> Order placed</li>',
    '  <gog-divider [inset]="true" />',
    '  <li><gog-icon name="clock" /> Awaiting payment</li>',
    '</ul>',
  ].join('\n');
  protected readonly insetTs = [
    "import { Component } from '@angular/core';",
    "import { DividerComponent, IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [DividerComponent, IconComponent],',
    '  template: `',
    '    <ul class="event-list">',
    '      <li><gog-icon name="success" /> Order placed</li>',
    '      <gog-divider [inset]="true" />',
    '      <li><gog-icon name="clock" /> Awaiting payment</li>',
    '    </ul>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
  protected readonly insetCss = [
    '.event-list {',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '}',
    '',
    '.event-list li {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  padding: 6px 0;',
    '}',
  ].join('\n');
}
