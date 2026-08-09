import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogIconName, IconComponent } from '@guildofgleks/ui';
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
    name: 'name',
    type: 'GogIconName',
    default: "'close'",
    description: 'Which built-in icon to render. Ignored when template is set.',
  },
  {
    name: 'template',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Replaces the built-in SVG entirely, for consumers who need a custom icon.',
  },
  {
    name: 'title',
    type: 'string',
    default: "''",
    description: 'Accessible label used when ariaHidden is false. Falls back to name if empty.',
  },
  {
    name: 'ariaHidden',
    type: 'boolean',
    default: 'true',
    description:
      'Icons are decorative by default and hidden from assistive tech. Set false for a standalone icon that carries its own meaning (with no adjacent text label).',
  },
];

const ICON_NAMES: readonly GogIconName[] = [
  'check',
  'close',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'calendar',
  'clock',
  'sort',
  'sort-up',
  'sort-down',
  'success',
  'error',
  'warning',
  'info',
  'checkbox',
  'checkbox-checked',
  'eye',
  'eye-off',
];

@Component({
  selector: 'app-icon-doc-page',
  imports: [IconComponent, MarkdownComponent, CodeTabsComponent, RouterLink],
  templateUrl: './icon-doc-page.html',
  styleUrl: './icon-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDocPage {
  protected readonly iconNames = ICON_NAMES;
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'icon')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [IconComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-icon name="check" />';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [IconComponent],',
    '  template: `<gog-icon name="check" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly galleryHtml = [
    '@for (iconName of iconNames; track iconName) {',
    '  <gog-icon [name]="iconName" />',
    '}',
  ].join('\n');
  protected readonly galleryTs = [
    "import { Component } from '@angular/core';",
    "import { GogIconName, IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [IconComponent],',
    '  template: `',
    '    @for (iconName of iconNames; track iconName) {',
    '      <gog-icon [name]="iconName" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly iconNames: GogIconName[] = [',
    "    'check', 'close', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',",
    "    'calendar', 'clock', 'sort', 'sort-up', 'sort-down',",
    "    'success', 'error', 'warning', 'info', 'checkbox', 'checkbox-checked', 'eye', 'eye-off',",
    '  ];',
    '}',
  ].join('\n');

  protected readonly sizingHtml = [
    '<gog-icon name="success" style="--gog-icon-size: 16px" />',
    '<gog-icon name="success" style="--gog-icon-size: 24px" />',
    '<gog-icon name="success" style="--gog-icon-size: 40px" />',
  ].join('\n');
  protected readonly sizingTs = [
    "import { Component } from '@angular/core';",
    "import { IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [IconComponent],',
    '  template: `',
    '    <gog-icon name="success" style="--gog-icon-size: 16px" />',
    '    <gog-icon name="success" style="--gog-icon-size: 24px" />',
    '    <gog-icon name="success" style="--gog-icon-size: 40px" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly meaningfulHtml =
    '<gog-icon name="warning" [ariaHidden]="false" title="Warning" />';
  protected readonly meaningfulTs = [
    "import { Component } from '@angular/core';",
    "import { IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [IconComponent],',
    '  template: `<gog-icon name="warning" [ariaHidden]="false" title="Warning" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly customTemplateHtml = [
    '<gog-icon [template]="customDot" />',
    '',
    '<ng-template #customDot>',
    '  <span style="width: 1em; height: 1em; border-radius: 50%; background: currentColor; display: block;"></span>',
    '</ng-template>',
  ].join('\n');
  protected readonly customTemplateTs = [
    "import { Component } from '@angular/core';",
    "import { IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [IconComponent],',
    '  template: `',
    '    <gog-icon [template]="customDot" />',
    '',
    '    <ng-template #customDot>',
    '      <span',
    '        style="width: 1em; height: 1em; border-radius: 50%; background: currentColor; display: block;"',
    '      ></span>',
    '    </ng-template>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
}
