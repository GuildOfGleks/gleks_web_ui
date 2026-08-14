import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'name',
    type: 'GogIconName',
    default: "'close'",
    description:
      'A built-in glyph, or any name registered through provideGogIcons(). Ignored when template is set.',
  },
  {
    name: 'template',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Replaces the SVG entirely with your own markup. For one-offs — for a whole icon set, register the names instead.',
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

const PROVIDER_ROWS: readonly ApiRow[] = [
  {
    name: 'provideGogIcons(icons)',
    type: 'Record<string, string> => Provider',
    default: '—',
    description:
      'Registers raw <svg> markup by name, app-wide or in any injector below it. A nested call layers onto the parent set rather than replacing it.',
    since: '21.4.0',
  },
  {
    name: 'GOG_ICONS',
    type: 'InjectionToken<Readonly<Record<string, string>>>',
    default: '{}',
    description:
      'The token provideGogIcons writes to. Inject it to read the registered set; you rarely need it directly.',
    since: '21.4.0',
  },
];

interface IconGroup {
  readonly title: string;
  readonly names: readonly GogBuiltinIconName[];
}

// Grouped by what a reader is looking for rather than alphabetically, matching the package's own
// AGENTS.md. `ICON_DEFS` is the source of the *names* — hand-copying them into an array is what
// let this page sit at 19 glyphs while the library shipped 41 — and `OTHER` catches anything a
// future release adds that no group here mentions yet, so a new icon can never go missing.
const GROUPED_NAMES: readonly IconGroup[] = [
  {
    title: 'Chevrons & arrows',
    names: [
      'chevron-up',
      'chevron-down',
      'chevron-left',
      'chevron-right',
      'arrow-left',
      'arrow-right',
    ],
  },
  { title: 'Confirm & dismiss', names: ['check', 'close', 'checkbox', 'checkbox-checked'] },
  { title: 'Status', names: ['success', 'error', 'warning', 'info'] },
  { title: 'Sorting', names: ['sort', 'sort-up', 'sort-down', 'filter'] },
  {
    title: 'Actions',
    names: [
      'search',
      'plus',
      'minus',
      'trash',
      'pencil',
      'copy',
      'download',
      'upload',
      'refresh',
      'external-link',
    ],
  },
  { title: 'Chrome', names: ['menu', 'more-horizontal', 'more-vertical', 'settings'] },
  {
    title: 'Objects & state',
    names: ['user', 'lock', 'mail', 'calendar', 'clock', 'eye', 'eye-off', 'star', 'star-filled'],
  },
];

const ALL_ICON_NAMES = Object.keys(ICON_DEFS) as GogBuiltinIconName[];

function buildGroups(): readonly IconGroup[] {
  const grouped = new Set(GROUPED_NAMES.flatMap((group) => group.names));
  const ungrouped = ALL_ICON_NAMES.filter((name) => !grouped.has(name));

  return ungrouped.length === 0
    ? GROUPED_NAMES
    : [...GROUPED_NAMES, { title: 'Other', names: ungrouped }];
}

@Component({
  selector: 'app-icon-doc-page',
  imports: [IconComponent, MarkdownComponent, CodeTabsComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './icon-doc-page.html',
  styleUrl: './icon-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDocPage {
  protected readonly iconGroups = buildGroups();
  protected readonly iconCount = ALL_ICON_NAMES.length;
  protected readonly apiInputs = API_INPUTS;
  protected readonly providerRows = PROVIDER_ROWS;
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
    "import { GogBuiltinIconName, ICON_DEFS, IconComponent } from '@guildofgleks/ui';",
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
    '  // Read off the library, never hand-copied: this list grew from 19 to 41 in one release,',
    '  // and a literal array would have gone stale without anything failing.',
    '  protected readonly iconNames = Object.keys(ICON_DEFS) as GogBuiltinIconName[];',
    '}',
  ].join('\n');

  protected readonly registerTs = [
    '```typescript',
    '// app.config.ts — register once, use the name anywhere an icon name is taken',
    "import { provideGogIcons } from '@guildofgleks/ui';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideGogIcons({',
    '      cart: \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>\',',
    '      rocket: \'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>\',',
    '    }),',
    '  ],',
    '};',
    '```',
  ].join('\n');

  protected readonly registerUsageHtml = [
    '```html',
    '<gog-icon name="cart" />',
    '<gog-tag iconName="cart">In basket</gog-tag>',
    '<gog-button iconStart="rocket">Launch</gog-button>',
    '```',
  ].join('\n');

  protected readonly overrideTs = [
    '```typescript',
    '// A registered name wins over the built-in of the same name — every checkmark the',
    '// library renders (checkbox, multiselect, toast) becomes yours, with no call site touched.',
    'provideGogIcons({',
    '  check: \'<svg viewBox="0 0 24 24">…your checkmark…</svg>\',',
    '});',
    '```',
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
