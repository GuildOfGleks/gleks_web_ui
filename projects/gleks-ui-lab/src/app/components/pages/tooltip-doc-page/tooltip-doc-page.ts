import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TOOLTIP_EXAMPLES } from '../../../examples/tooltip/sources.generated';
import { TooltipConfigExample } from '../../../examples/tooltip/tooltip-config/example';
import { TooltipContentExample } from '../../../examples/tooltip/tooltip-content/example';
import { TooltipDelaysExample } from '../../../examples/tooltip/tooltip-delays/example';
import { TooltipDismissExample } from '../../../examples/tooltip/tooltip-dismiss/example';
import { TooltipOverviewExample } from '../../../examples/tooltip/tooltip-overview/example';
import { TooltipPositionsExample } from '../../../examples/tooltip/tooltip-positions/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'gogTooltip',
    type: 'string | TemplateRef<unknown> | null',
    default: 'null',
    description:
      'The bubble’s content. A plain string for the common case, or a TemplateRef for richer markup.',
  },
  {
    name: 'gogTooltipPosition',
    type: "'auto' | 'top' | 'bottom' | 'left' | 'right'",
    default: "GOG_CONFIG.tooltip.position ?? 'auto'",
    description:
      'Which side the bubble renders on. auto prefers top, then bottom, then right, then left. An explicit side still flips to its opposite if the requested one has no room but the opposite does.',
  },
  {
    name: 'gogTooltipShowDelay',
    type: 'number',
    default: 'GOG_CONFIG.tooltip.showDelay ?? 300',
    description: 'Milliseconds of hover or focus before the bubble appears.',
  },
  {
    name: 'gogTooltipHideDelay',
    type: 'number',
    default: 'GOG_CONFIG.tooltip.hideDelay ?? 100',
    description:
      'Milliseconds before it disappears. The gap is what lets the pointer travel from the trigger onto the bubble.',
  },
  {
    name: 'gogTooltipDisabled',
    type: 'boolean',
    default: 'false',
    description: 'Suppresses the tooltip without removing the directive.',
  },
  {
    name: 'gogTooltipClass',
    type: 'string',
    default: "''",
    description:
      'A class applied straight to the bubble, for restyling or resizing one instance. It must come from an unscoped (global) stylesheet — the bubble lives on document.body, outside any component’s scoped styles.',
  },
];

@Component({
  selector: 'app-tooltip-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './tooltip-doc-page.html',
  styleUrl: './tooltip-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tooltip')?.tokens ?? [];

  protected readonly sources = TOOLTIP_EXAMPLES;
  protected readonly examples = {
    overview: TooltipOverviewExample,
    positions: TooltipPositionsExample,
    content: TooltipContentExample,
    delays: TooltipDelaysExample,
    dismiss: TooltipDismissExample,
    config: TooltipConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { GogTooltipDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogTooltipDirective],\n})\n```";

  protected readonly classSnippet = [
    '```html',
    '<button gogButton gogTooltip="Styled" gogTooltipClass="brand-tooltip">Styled</button>',
    '```',
    '',
    '```css',
    '/* styles.css — global, because the bubble is outside every component. */',
    '.brand-tooltip {',
    '  --gog-tooltip-bg: var(--gog-accent-color);',
    '  --gog-tooltip-color: var(--gog-surface-color);',
    '}',
    '```',
  ].join('\n');
}
