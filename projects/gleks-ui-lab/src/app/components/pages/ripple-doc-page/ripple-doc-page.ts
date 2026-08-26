import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoComponent } from '../../shared/demo/demo';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { RIPPLE_EXAMPLES } from '../../../examples/ripple/sources.generated';
import { RippleBadgeExample } from '../../../examples/ripple/ripple-badge/example';
import { RippleOptionsExample } from '../../../examples/ripple/ripple-options/example';
import { RippleOverviewExample } from '../../../examples/ripple/ripple-overview/example';
import { RippleSuppressedExample } from '../../../examples/ripple/ripple-suppressed/example';
import { RippleSurfaceVsWrapperExample } from '../../../examples/ripple/ripple-surface-vs-wrapper/example';
import { RippleThemingExample } from '../../../examples/ripple/ripple-theming/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

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

/** The nine surfaces 21.6.1 wired the ripple into, each with its own `ripple` input. */
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
  imports: [DemoComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './ripple-doc-page.html',
  styleUrl: './ripple-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly wiredSurfaces = WIRED_SURFACES;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'ripple')?.tokens ?? [];

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

  protected readonly sources = RIPPLE_EXAMPLES;
  protected readonly examples = {
    overview: RippleOverviewExample,
    badge: RippleBadgeExample,
    surfaceVsWrapper: RippleSurfaceVsWrapperExample,
    options: RippleOptionsExample,
    suppressed: RippleSuppressedExample,
    theming: RippleThemingExample,
  };
}
