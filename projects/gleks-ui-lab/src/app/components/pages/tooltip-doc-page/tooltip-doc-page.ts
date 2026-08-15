import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TOOLTIP_EXAMPLE_SOURCES } from '../../../examples/tooltip/sources.generated';
import { TooltipDelaysExample } from '../../../examples/tooltip/tooltip-delays.example';
import { TooltipOverviewExample } from '../../../examples/tooltip/tooltip-overview.example';
import { TooltipPositionsExample } from '../../../examples/tooltip/tooltip-positions.example';
import { TooltipTemplateExample } from '../../../examples/tooltip/tooltip-template.example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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
    ExampleHostComponent,
    GogTooltipDirective,
    ButtonComponent,
    MarkdownComponent,
    RouterLink,
  ],
  providers: [provideExampleSources(TOOLTIP_EXAMPLE_SOURCES)],
  templateUrl: './tooltip-doc-page.html',
  styleUrl: './tooltip-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDocPage {
  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];

  protected readonly longText =
    'A tooltip taller than --gog-tooltip-max-height scrolls inside an internal gog-scroll, ' +
    'using the same themeable scrollbar as every other overflowing panel in this library. ' +
    'Move the pointer onto the bubble and the pending hide is cancelled rather than raced, ' +
    'so you can actually read it — that is WCAG 2.1 SC 1.4.13. Content under the cap renders ' +
    'at exactly its own height, so a short tooltip is never padded out to a fixed box.';

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tooltip')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { GogTooltipDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogTooltipDirective],\n})\n```";

  protected readonly configSnippet = [
    '```typescript',
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'bootstrapApplication(App, {',
    '  providers: [',
    '    provideGogConfig({',
    '      tooltip: {',
    "        position: 'top',",
    '        showDelay: 150,',
    '        hideDelay: 100,',
    '      },',
    '    }),',
    '  ],',
    '});',
    '```',
  ].join('\n');
  /** Each example is a file under `src/app/examples/tooltip/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    delays: TooltipDelaysExample,
    overview: TooltipOverviewExample,
    positions: TooltipPositionsExample,
    template: TooltipTemplateExample,
  };
}
