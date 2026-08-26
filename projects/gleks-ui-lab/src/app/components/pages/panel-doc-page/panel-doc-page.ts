import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoComponent } from '../../shared/demo/demo';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { PANEL_EXAMPLES } from '../../../examples/panel/sources.generated';
import { PanelCollapsibleExample } from '../../../examples/panel/panel-collapsible/example';
import { PanelLoadingExample } from '../../../examples/panel/panel-loading/example';
import { PanelOverlayExample } from '../../../examples/panel/panel-overlay/example';
import { PanelOverviewExample } from '../../../examples/panel/panel-overview/example';
import { PanelThemingExample } from '../../../examples/panel/panel-theming/example';
import { PanelVariantsExample } from '../../../examples/panel/panel-variants/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

interface SlotRow {
  readonly name: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'variant',
    type: 'GogSurfaceVariant',
    default: "'elevated'",
    description:
      "'outlined' | 'elevated' | 'filled'. Elevated is the default here, because a page region is usually the raised thing on the page.",
    since: '21.6.1',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'lg'",
    description: 'Drives padding and the gap between the panel’s rows, on the five-tier scale.',
    since: '21.6.1',
  },
  {
    name: 'collapsible',
    type: 'boolean',
    default: 'false',
    description:
      'Adds the toggle and composes gog-collapsible underneath. A bare attribute works. Note a collapsible panel clips while animating.',
    since: '21.6.1',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Marks the toggle aria-disabled and stops it acting; the content stays readable. A bare attribute works.',
    since: '21.6.1',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Replaces the body with placeholder lines and sets aria-busy. The heading and footer stay put.',
    since: '21.6.1',
  },
  {
    name: 'skeletonLines',
    type: 'number',
    default: '3',
    description: 'How many placeholder lines the loading body draws.',
    since: '21.6.1',
  },
];

const API_MODELS: readonly ApiRow[] = [
  {
    name: 'open',
    type: 'boolean',
    default: 'true',
    description:
      'Two-way bindable. Ignored while collapsible is off. Emits openChange, so [(open)] works.',
    since: '21.6.1',
  },
];

const API_SLOTS: readonly SlotRow[] = [
  {
    name: 'gogPanelHeader',
    description:
      'Attribute directive on your own heading. Becomes the region’s accessible name and the toggle’s label.',
    since: '21.6.1',
  },
  {
    name: 'gogPanelFooter',
    description:
      'Attribute directive on your own element. Sits below the body, above the panel’s edge, and survives loading.',
    since: '21.6.1',
  },
];

@Component({
  selector: 'app-panel-doc-page',
  imports: [DemoComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './panel-doc-page.html',
  styleUrl: './panel-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiModels = API_MODELS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'panel')?.tokens ?? [];

  protected readonly importSnippet = [
    '```typescript',
    'import {',
    '  GogPanelFooterDirective,',
    '  GogPanelHeaderDirective,',
    '  PanelComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [PanelComponent, GogPanelHeaderDirective, GogPanelFooterDirective],',
    '})',
    '```',
  ].join('\n');

  protected readonly sources = PANEL_EXAMPLES;
  protected readonly examples = {
    overview: PanelOverviewExample,
    variants: PanelVariantsExample,
    collapsible: PanelCollapsibleExample,
    overlay: PanelOverlayExample,
    loading: PanelLoadingExample,
    theming: PanelThemingExample,
  };
}
