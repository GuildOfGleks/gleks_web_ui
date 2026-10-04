import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { RIPPLE_EXAMPLES } from '../../../examples/ripple/sources.generated';
import { RippleBadgeExample } from '../../../examples/ripple/ripple-badge/example';
import { RippleConfigExample } from '../../../examples/ripple/ripple-config/example';
import { RippleOverviewExample } from '../../../examples/ripple/ripple-overview/example';
import { RippleStatesExample } from '../../../examples/ripple/ripple-states/example';
import { RippleSurfaceVsWrapperExample } from '../../../examples/ripple/ripple-surface-vs-wrapper/example';
import { RippleThemingExample } from '../../../examples/ripple/ripple-theming/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'rippleDisabled',
    type: 'boolean',
    default: 'false',
    description:
      'Switches the effect off. Detaches the listeners and drops the host class rather than ignoring events, so a disabled ripple costs nothing.',
    since: '21.6.1',
  },
  {
    name: 'rippleCentred',
    type: 'boolean',
    default: 'false',
    description:
      'Starts the wave from the middle instead of from the pointer. Keyboard activation is always centred, because a key press carries no coordinates.',
    since: '21.6.1',
  },
];

const WIRED_SURFACES: readonly string[] = [
  'gog-button',
  '[gogButton]',
  'gog-button-toggle-group',
  'gog-chip',
  'gog-tabs',
  'gog-accordion',
  'gogCollapsibleTrigger',
  'gogMenuItem',
  'gog-select / gog-multiselect / gog-autocomplete options',
];

@Component({
  selector: 'app-ripple-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './ripple-doc-page.html',
  styleUrl: './ripple-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'ripple')?.tokens ?? [];

  protected readonly sources = RIPPLE_EXAMPLES;
  protected readonly examples = {
    overview: RippleOverviewExample,
    states: RippleStatesExample,
    surfaceVsWrapper: RippleSurfaceVsWrapperExample,
    badge: RippleBadgeExample,
    theming: RippleThemingExample,
    config: RippleConfigExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { GogRippleDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [GogRippleDirective],',
    '})',
    '```',
  ].join('\n');

  protected readonly wiredSurfaces = WIRED_SURFACES;

  protected readonly enableSnippet = [
    '```typescript',
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideGogConfig({ ripple: { enabled: true } }),',
    '  ],',
    '};',
    '```',
  ].join('\n');
}
