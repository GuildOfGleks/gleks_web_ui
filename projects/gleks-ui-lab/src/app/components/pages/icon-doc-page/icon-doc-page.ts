import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { ICON_EXAMPLES } from '../../../examples/icon/sources.generated';
import { IconColourExample } from '../../../examples/icon/icon-colour/example';
import { IconContextExample } from '../../../examples/icon/icon-context/example';
import { IconGalleryExample } from '../../../examples/icon/icon-gallery/example';
import { IconNamedExample } from '../../../examples/icon/icon-named/example';
import { IconOverrideExample } from '../../../examples/icon/icon-override/example';
import { IconOverviewExample } from '../../../examples/icon/icon-overview/example';
import { IconRegistryExample } from '../../../examples/icon/icon-registry/example';
import { IconSizeExample } from '../../../examples/icon/icon-size/example';
import { IconTemplateExample } from '../../../examples/icon/icon-template/example';
import { IconUnknownExample } from '../../../examples/icon/icon-unknown/example';

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
      'Icons are decorative by default and hidden from assistive tech. Set false for a standalone icon that carries its own meaning (with no adjacent text label): it becomes role="img", named by title or else name. Before 21.15.0 it got the label without the role, which Chrome exposes as an unnamed generic.',
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

@Component({
  selector: 'app-icon-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './icon-doc-page.html',
  styleUrl: './icon-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly providerRows = PROVIDER_ROWS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'icon')?.tokens ?? [];

  protected readonly sources = ICON_EXAMPLES;
  protected readonly examples = {
    overview: IconOverviewExample,
    gallery: IconGalleryExample,
    context: IconContextExample,
    size: IconSizeExample,
    colour: IconColourExample,
    named: IconNamedExample,
    template: IconTemplateExample,
    unknown: IconUnknownExample,
    registry: IconRegistryExample,
    override: IconOverrideExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [IconComponent],\n})\n```";

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
}
