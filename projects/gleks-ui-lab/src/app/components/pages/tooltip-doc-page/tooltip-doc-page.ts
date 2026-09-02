import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ChipComponent,
  GogTooltipDirective,
  GogTooltipPosition,
  IconComponent,
  TagComponent,
} from '@guildofgleks/ui';
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
    GogTooltipDirective,
    ButtonComponent,
    ChipComponent,
    IconComponent,
    TagComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
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

  protected readonly overviewHtml = [
    '<button gogTooltip="Save changes">Save</button>',
    '',
    '<!-- Or on a gog-* component’s own host tag — it needs to know nothing about it. -->',
    '<gog-chip [gogTooltip]="hint">Draft</gog-chip>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { ChipComponent, GogTooltipDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ChipComponent, GogTooltipDirective],',
    '  template: `',
    '    <button gogTooltip="Save changes">Save</button>',
    '    <gog-chip [gogTooltip]="hint">Draft</gog-chip>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly hint = 'Not visible to anyone else yet';",
    '}',
  ].join('\n');

  protected readonly positionsHtml = [
    '<gog-button gogTooltip="Above" gogTooltipPosition="top">top</gog-button>',
    '<gog-button gogTooltip="Below" gogTooltipPosition="bottom">bottom</gog-button>',
    '<gog-button gogTooltip="To the left" gogTooltipPosition="left">left</gog-button>',
    '<gog-button gogTooltip="To the right" gogTooltipPosition="right">right</gog-button>',
  ].join('\n');
  protected readonly positionsTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogTooltipDirective],',
    '  template: `',
    '    @for (position of positions; track position) {',
    '      <gog-button [gogTooltip]="position" [gogTooltipPosition]="position">',
    '        {{ position }}',
    '      </gog-button>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];",
    '}',
  ].join('\n');

  protected readonly templateHtml = [
    '<ng-template #richHint>',
    '  <strong>Deployment blocked</strong>',
    '  <p>Two checks are still running. <gog-tag variant="warning">CI</gog-tag></p>',
    '</ng-template>',
    '',
    '<gog-button [gogTooltip]="richHint">Deploy</gog-button>',
  ].join('\n');
  protected readonly templateTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogTooltipDirective, TagComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, TagComponent, GogTooltipDirective],',
    '  template: `',
    '    <ng-template #richHint>',
    '      <strong>Deployment blocked</strong>',
    '      <p>Two checks are still running. <gog-tag variant="warning">CI</gog-tag></p>',
    '    </ng-template>',
    '',
    '    <gog-button [gogTooltip]="richHint">Deploy</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly delaysHtml = [
    '<gog-button gogTooltip="Appears at once" [gogTooltipShowDelay]="0">No delay</gog-button>',
    '<gog-button gogTooltip="Takes a second" [gogTooltipShowDelay]="1000">Slow</gog-button>',
    '<gog-button gogTooltip="Never shown" [gogTooltipDisabled]="true">Disabled</gog-button>',
  ].join('\n');
  protected readonly delaysTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogTooltipDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, GogTooltipDirective],',
    '  template: `',
    '    <gog-button gogTooltip="Appears at once" [gogTooltipShowDelay]="0">No delay</gog-button>',
    '    <gog-button gogTooltip="Never shown" [gogTooltipDisabled]="true">Disabled</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

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
}
