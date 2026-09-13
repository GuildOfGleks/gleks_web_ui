import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { ALERT_EXAMPLES } from '../../../examples/alert/sources.generated';
import { AlertDismissibleExample } from '../../../examples/alert/alert-dismissible/example';
import { AlertIconsExample } from '../../../examples/alert/alert-icons/example';
import { AlertLiveExample } from '../../../examples/alert/alert-live/example';
import { AlertOverviewExample } from '../../../examples/alert/alert-overview/example';
import { AlertSeveritiesExample } from '../../../examples/alert/alert-severities/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

interface OutputRow {
  readonly name: string;
  readonly type: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'severity',
    type: 'GogSeverity',
    default: "'accent'",
    description:
      "'accent' | 'success' | 'danger' | 'warning' | 'info' — the same type gog-button, gog-progressbar and gogBadge take. Picks the edge colour and the glyph. 'accent' claims nothing, which is the right default for a notice that is neither good news nor bad.",
  },
  {
    name: 'heading',
    type: 'string | undefined',
    default: 'undefined',
    description: 'Optional title above the projected body. A one-line message needs none.',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'false',
    description:
      'Shows the close button and enables dismissed. The alert never removes itself — see the output below.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null | undefined',
    default: 'undefined',
    description:
      "Overrides the severity's glyph. null removes the icon entirely, for a message whose words already carry its meaning.",
  },
  {
    name: 'live',
    type: 'GogAlertLive | undefined',
    default: 'from severity',
    description:
      "'assertive' | 'polite' | 'off'. Unset, danger and warning are assertive and the rest polite. Set 'off' for an alert that is already on the page when it loads.",
  },
];

const API_OUTPUTS: readonly OutputRow[] = [
  {
    name: 'dismissed',
    type: 'void',
    description:
      'The close button was pressed. The alert is still in the DOM when this fires; hiding it, retrying or navigating is your decision.',
  },
];

@Component({
  selector: 'app-alert-doc-page',
  imports: [DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './alert-doc-page.html',
  styleUrl: './alert-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'alert')?.tokens ?? [];

  protected readonly importSnippet = [
    '```typescript',
    "import { AlertComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [AlertComponent],',
    '})',
    '```',
  ].join('\n');

  protected readonly sources = ALERT_EXAMPLES;
  protected readonly examples = {
    overview: AlertOverviewExample,
    severities: AlertSeveritiesExample,
    dismissible: AlertDismissibleExample,
    icons: AlertIconsExample,
    live: AlertLiveExample,
  };
}
