import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';
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
    name: 'axis',
    type: "'vertical' | 'horizontal' | 'both'",
    default: "'vertical'",
    description: 'Which axes get an overlay thumb. Native scrolling on the other axis is unaffected.',
  },
  {
    name: 'size',
    type: "'normal' | 'thin' | undefined",
    default: 'undefined',
    description: "Unset, falls back to GOG_CONFIG.scroll.size, then to 'normal'.",
  },
  {
    name: 'autoHide',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Fades the thumb out after hideDelay ms of inactivity; false keeps it always visible. Unset, falls back to GOG_CONFIG.scroll.autoHide, then to true.',
  },
  {
    name: 'hideDelay',
    type: 'number | undefined',
    default: 'undefined',
    description: 'Unset, falls back to GOG_CONFIG.scroll.hideDelay, then to 800.',
  },
  {
    name: 'reachThreshold',
    type: 'number',
    default: '0',
    description: 'Pixel distance from an edge that still counts as "reached" for gogReachStart/gogReachEnd.',
  },
  {
    name: 'focusable',
    type: 'boolean',
    default: 'true',
    description:
      'Renders the viewport as its own tab stop (tabindex="0", role="region"). Turn off when nesting inside a component that already owns focus/keyboard handling.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the viewport when focusable is true and there is no visible label.',
  },
  {
    name: 'overscrollBehavior',
    type: "'auto' | 'contain' | 'none' | undefined",
    default: 'undefined',
    description:
      'What happens when a scroll gesture reaches this instance\'s edge. Unset, falls back to GOG_CONFIG.scroll.overscrollBehavior, then to \'auto\' — chains to the next scrollable ancestor.',
  },
];

const API_OUTPUTS: readonly { name: string; payload: string; description: string }[] = [
  {
    name: 'gogScroll',
    payload: 'GogScrollMetrics',
    description: 'Emits scrollTop/scrollLeft/scrollHeight/scrollWidth/clientHeight/clientWidth on every scroll/resize.',
  },
  {
    name: 'gogReachStart',
    payload: "'vertical' | 'horizontal'",
    description: 'Fires once when that axis crosses back within reachThreshold of its start edge.',
  },
  {
    name: 'gogReachEnd',
    payload: "'vertical' | 'horizontal'",
    description: 'Fires once when that axis crosses within reachThreshold of its end edge.',
  },
];

const API_METHODS: readonly { name: string; description: string }[] = [
  { name: 'scrollTo(options: ScrollToOptions)', description: "Forwards to the viewport's native Element.scrollTo." },
  { name: "scrollToTop(behavior = 'smooth')", description: 'Scrolls to the top.' },
  { name: "scrollToBottom(behavior = 'smooth')", description: 'Scrolls to the bottom.' },
  { name: "scrollToLeft(behavior = 'smooth')", description: 'Scrolls to the left edge.' },
  { name: "scrollToRight(behavior = 'smooth')", description: 'Scrolls to the right edge.' },
];

@Component({
  selector: 'app-scroll-doc-page',
  imports: [ScrollComponent, ButtonComponent, MarkdownComponent, CodeTabsComponent, RouterLink, DecimalPipe],
  templateUrl: './scroll-doc-page.html',
  styleUrl: './scroll-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiMethods = API_METHODS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'scroll')?.tokens ?? [];

  protected readonly longItems = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
  protected readonly wideItems = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`);

  protected readonly sizeOption = signal<'normal' | 'thin'>('normal');
  protected readonly autoHide = signal(true);

  protected readonly reachState = signal('Scroll to the edges to see gogReachStart / gogReachEnd fire.');
  protected readonly lastMetrics = signal<GogScrollMetrics | null>(null);

  protected readonly importSnippet =
    "```typescript\nimport { ScrollComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ScrollComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-scroll style="height: 200px" ariaLabel="Example list">',
    '  @for (item of items; track item) {',
    '    <p>{{ item }}</p>',
    '  }',
    '</gog-scroll>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { ScrollComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ScrollComponent],',
    '  template: `',
    '    <gog-scroll style="height: 200px" ariaLabel="Example list">',
    '      @for (item of items; track item) {',
    '        <p>{{ item }}</p>',
    '      }',
    '    </gog-scroll>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);",
    '}',
  ].join('\n');

  protected readonly axisHtml = [
    '<!-- vertical (default) -->',
    '<gog-scroll style="height: 160px">…</gog-scroll>',
    '',
    '<!-- horizontal -->',
    '<gog-scroll axis="horizontal" style="width: 320px">',
    '  <div style="display: flex; gap: 8px;">…</div>',
    '</gog-scroll>',
    '',
    '<!-- both -->',
    '<gog-scroll axis="both" style="height: 160px; width: 320px">',
    '  <div style="width: 600px;">…</div>',
    '</gog-scroll>',
  ].join('\n');
  protected readonly axisTs = [
    "import { Component } from '@angular/core';",
    "import { ScrollComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ScrollComponent],',
    '  template: `',
    '    <gog-scroll axis="both" style="height: 160px; width: 320px">',
    '      <div style="width: 600px;">…</div>',
    '    </gog-scroll>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly sizeAutoHideHtml = [
    '<gog-scroll [size]="size" [autoHide]="autoHide" style="height: 160px">…</gog-scroll>',
  ].join('\n');
  protected readonly sizeAutoHideTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ScrollComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ScrollComponent],',
    '  template: `<gog-scroll [size]="size()" [autoHide]="autoHide()" style="height: 160px">…</gog-scroll>`,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly size = signal<'normal' | 'thin'>('normal');",
    '  protected readonly autoHide = signal(true);',
    '}',
  ].join('\n');

  protected readonly reachHtml = [
    '<gog-scroll',
    '  style="height: 160px"',
    '  [reachThreshold]="8"',
    '  (gogReachStart)="reachState.set(\'At the top\')"',
    '  (gogReachEnd)="reachState.set(\'At the bottom\')"',
    '  (gogScroll)="onScroll($event)"',
    '>',
    '  …',
    '</gog-scroll>',
  ].join('\n');
  protected readonly reachTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogScrollMetrics, ScrollComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ScrollComponent],',
    '  template: `',
    '    <gog-scroll',
    '      style="height: 160px"',
    '      [reachThreshold]="8"',
    "      (gogReachStart)=\"reachState.set('At the top')\"",
    "      (gogReachEnd)=\"reachState.set('At the bottom')\"",
    '      (gogScroll)="onScroll($event)"',
    '    >',
    '      …',
    '    </gog-scroll>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly reachState = signal('Scroll to see it fire.');",
    '',
    '  protected onScroll(metrics: GogScrollMetrics): void {',
    '    console.log(metrics.scrollTop, metrics.scrollHeight);',
    '  }',
    '}',
  ].join('\n');

  protected readonly methodsHtml = [
    '<gog-button size="sm" (gogClick)="scroller.scrollToTop()">To top</gog-button>',
    '<gog-button size="sm" (gogClick)="scroller.scrollToBottom()">To bottom</gog-button>',
    '',
    '<gog-scroll #scroller style="height: 160px">…</gog-scroll>',
  ].join('\n');
  protected readonly methodsTs = [
    "import { Component, viewChild } from '@angular/core';",
    "import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, ScrollComponent],',
    '  template: `',
    '    <gog-button size="sm" (gogClick)="scroller()?.scrollToTop()">To top</gog-button>',
    '    <gog-button size="sm" (gogClick)="scroller()?.scrollToBottom()">To bottom</gog-button>',
    '',
    '    <gog-scroll #scroller style="height: 160px">…</gog-scroll>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly scroller = viewChild<ScrollComponent>('scroller');",
    '}',
  ].join('\n');

  protected readonly configHtml = [
    '// app.config.ts',
    'providers: [',
    '  provideGogConfig({',
    '    scroll: { size: \'thin\', hideDelay: 1200, overscrollBehavior: \'contain\' },',
    '  }),',
    '],',
  ].join('\n');
  protected readonly configTs = [
    "import { ApplicationConfig } from '@angular/core';",
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideGogConfig({',
    "      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },",
    '    }),',
    '  ],',
    '};',
  ].join('\n');

  protected onScroll(metrics: GogScrollMetrics): void {
    this.lastMetrics.set(metrics);
  }
}
