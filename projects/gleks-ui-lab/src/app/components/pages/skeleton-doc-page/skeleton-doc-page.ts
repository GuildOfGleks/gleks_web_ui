import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogSize,
  GogSkeletonAnimation,
  SkeletonComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
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
    name: 'shape',
    type: "'text' | 'circle' | 'rect'",
    default: "'text'",
    description: 'text for lines of copy, circle for avatars, rect for images or media blocks.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Line thickness, circle diameter, and default rect height.',
  },
  {
    name: 'animation',
    type: "'pulse' | 'wave' | 'none'",
    default: "'pulse'",
    description:
      'pulse fades opacity, wave sweeps a shimmer highlight, none holds a static tone — useful under prefers-reduced-motion or when the surrounding UI is already busy.',
  },
  {
    name: 'width',
    type: 'string | null',
    default: 'null',
    description: "CSS width, e.g. '240px' or '60%'. Falls back to a shape/size default when unset.",
  },
  {
    name: 'height',
    type: 'string | null',
    default: 'null',
    description: 'CSS height override. Ignored for text, whose lines size from size instead.',
  },
  {
    name: 'lines',
    type: 'number',
    default: '1',
    description:
      'shape="text" only: number of stacked lines. Past one line, the last one renders shorter.',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: 'true',
    description:
      'Set false to square off the corners — handy for a banner image that bleeds to the edge.',
  },
  {
    name: 'ariaLabel',
    type: 'string | null',
    default: 'null',
    description:
      'Decorative (aria-hidden) by default, since a page can carry dozens of these while loading. Set on the one instance that should actually announce the loading state — it then gets role="status".',
  },
];

interface Product {
  readonly name: string;
  readonly price: string;
  readonly color: string;
}

const PRODUCTS: readonly Product[] = [
  { name: 'Aurora Desk Lamp', price: '$68', color: '#d4b483' },
  { name: 'Trailblazer Jacket', price: '$142', color: '#7f9c96' },
  { name: 'Nimbus Wireless Buds', price: '$89', color: '#8f8bd6' },
  { name: 'Fieldnotes Journal', price: '$24', color: '#c97b63' },
];

interface ChatMessage {
  readonly fromMe: boolean;
  readonly width: string;
  readonly text: string;
}

const CHAT_MESSAGES: readonly ChatMessage[] = [
  { fromMe: false, width: '55%', text: 'Hey! Did you see the new release notes?' },
  { fromMe: true, width: '38%', text: 'Just opened them now.' },
  { fromMe: false, width: '68%', text: 'The multiselect keyboard nav fix is finally in 🎉' },
  { fromMe: false, width: '32%', text: 'About time.' },
  { fromMe: true, width: '50%', text: "I'll update the doc pages this week." },
];

@Component({
  selector: 'app-skeleton-doc-page',
  imports: [SkeletonComponent, ButtonComponent, MarkdownComponent, CodeTabsComponent, RouterLink],
  templateUrl: './skeleton-doc-page.html',
  styleUrl: './skeleton-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDocPage implements OnDestroy {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'skeleton')?.tokens ?? [];

  protected readonly products = PRODUCTS;
  protected readonly chatMessages = CHAT_MESSAGES;

  protected readonly profileLoading = signal(false);
  protected readonly productsLoading = signal(true);
  protected readonly chatLoading = signal(true);
  private profileTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly importSnippet =
    "```typescript\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SkeletonComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-skeleton shape="text" [lines]="3" style="width: 220px" />';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `<gog-skeleton shape="text" [lines]="3" style="width: 220px" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly shapesHtml = [
    '<gog-skeleton shape="text" [lines]="3" style="width: 220px" />',
    '<gog-skeleton shape="circle" size="lg" />',
    '<gog-skeleton shape="rect" size="sm" />',
  ].join('\n');
  protected readonly shapesTs = [
    "import { Component } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    <gog-skeleton shape="text" [lines]="3" style="width: 220px" />',
    '    <gog-skeleton shape="circle" size="lg" />',
    '    <gog-skeleton shape="rect" size="sm" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly linesHtml = [
    '<gog-skeleton shape="text" [lines]="1" />',
    '<gog-skeleton shape="text" [lines]="3" />',
    '<gog-skeleton shape="text" [lines]="5" size="sm" />',
  ].join('\n');
  protected readonly linesTs = [
    "import { Component } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    <gog-skeleton shape="text" [lines]="1" />',
    '    <gog-skeleton shape="text" [lines]="3" />',
    '    <gog-skeleton shape="text" [lines]="5" size="sm" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-skeleton shape="circle" [size]="sizeOption" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-skeleton shape="circle" [size]="sizeOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly animationsHtml = [
    '@for (animationOption of animations; track animationOption) {',
    '  <gog-skeleton shape="rect" size="xsm" [animation]="animationOption" />',
    '}',
  ].join('\n');
  protected readonly animationsTs = [
    "import { Component } from '@angular/core';",
    "import { GogSkeletonAnimation, SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    @for (animationOption of animations; track animationOption) {',
    '      <gog-skeleton shape="rect" size="xsm" [animation]="animationOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];",
    '}',
  ].join('\n');

  protected readonly dimensionsHtml = [
    '<gog-skeleton shape="rect" width="100%" height="64px" />',
    '<gog-skeleton shape="circle" width="56px" />',
    '<gog-skeleton shape="rect" [rounded]="false" />',
  ].join('\n');
  protected readonly dimensionsTs = [
    "import { Component } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    <gog-skeleton shape="rect" width="100%" height="64px" />',
    '    <gog-skeleton shape="circle" width="56px" />',
    '    <gog-skeleton shape="rect" [rounded]="false" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly profileHtml = [
    '@if (loading()) {',
    '  <div class="profile-card__header">',
    '    <gog-skeleton shape="circle" size="lg" ariaLabel="Loading profile" />',
    '    <div class="profile-card__header-text">',
    '      <gog-skeleton shape="text" width="65%" />',
    '      <gog-skeleton shape="text" width="40%" size="sm" />',
    '    </div>',
    '  </div>',
    '  <gog-skeleton shape="rect" size="md" />',
    '  <gog-skeleton shape="text" [lines]="3" />',
    '} @else {',
    '  <!-- real avatar, name, banner, bio -->',
    '}',
  ].join('\n');
  protected readonly profileCss = [
    '/* The placeholder borrows the real card’s layout, which is the whole trick: swapping',
    '   skeletons for content must not move anything. */',
    '.profile-card__header {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 14px;',
    '}',
    '',
    '.profile-card__header-text {',
    '  display: grid;',
    '  gap: 8px;',
    '  flex: 1 1 auto;',
    '  /* Lets the text column shrink instead of forcing the row wider than its container. */',
    '  min-width: 0;',
    '}',
  ].join('\n');
  protected readonly profileTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    @if (loading()) {',
    '      <div class="profile-card__header">',
    '        <gog-skeleton shape="circle" size="lg" ariaLabel="Loading profile" />',
    '        <div class="profile-card__header-text">',
    '          <gog-skeleton shape="text" width="65%" />',
    '          <gog-skeleton shape="text" width="40%" size="sm" />',
    '        </div>',
    '      </div>',
    '      <gog-skeleton shape="rect" size="md" />',
    '      <gog-skeleton shape="text" [lines]="3" />',
    '    } @else {',
    '      <!-- real avatar, name, banner, bio -->',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly loading = signal(true);',
    '}',
  ].join('\n');

  protected readonly productsHtml = [
    '<div class="product-grid">',
    '  @for (placeholder of [0, 1, 2, 3]; track placeholder) {',
    '    <div class="product-card">',
    '      <gog-skeleton shape="rect" height="120px" />',
    '      <gog-skeleton shape="text" width="80%" />',
    '      <gog-skeleton shape="text" width="30%" size="sm" />',
    '    </div>',
    '  }',
    '</div>',
  ].join('\n');
  protected readonly productsCss = [
    '.product-grid {',
    '  display: grid;',
    '  /* auto-fill, so the placeholder grid reflows exactly like the real one and the reader',
    '     never sees the column count change when the data lands. */',
    '  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));',
    '  gap: 16px;',
    '}',
    '',
    '.product-card {',
    '  display: grid;',
    '  gap: 8px;',
    '}',
  ].join('\n');
  protected readonly productsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    <div class="product-grid">',
    '      @for (placeholder of [0, 1, 2, 3]; track placeholder) {',
    '        <div class="product-card">',
    '          <gog-skeleton shape="rect" height="120px" />',
    '          <gog-skeleton shape="text" width="80%" />',
    '          <gog-skeleton shape="text" width="30%" size="sm" />',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly loading = signal(true);',
    '}',
  ].join('\n');

  protected readonly chatHtml = [
    '<div class="chat-thread">',
    '  @for (message of messages; track $index) {',
    '    <div class="chat-row" [class.chat-row--mine]="message.fromMe">',
    '      @if (!message.fromMe) {',
    '        <gog-skeleton shape="circle" size="xsm" />',
    '      }',
    '      <gog-skeleton shape="rect" size="sm" [width]="message.width" />',
    '    </div>',
    '  }',
    '</div>',
  ].join('\n');
  protected readonly chatCss = [
    '.chat-thread {',
    '  display: grid;',
    '  gap: 10px;',
    '  max-width: 380px;',
    '}',
    '',
    '/* flex-end, so a bubble taller than the avatar keeps the two bottom-aligned — the same',
    '   rule the real thread uses. */',
    '.chat-row {',
    '  display: flex;',
    '  align-items: flex-end;',
    '  gap: 10px;',
    '}',
    '',
    '.chat-row--mine {',
    '  justify-content: flex-end;',
    '}',
  ].join('\n');
  protected readonly chatTs = [
    "import { Component } from '@angular/core';",
    "import { SkeletonComponent } from '@guildofgleks/ui';",
    '',
    'interface ChatMessage {',
    '  fromMe: boolean;',
    '  width: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SkeletonComponent],',
    '  template: `',
    '    <div class="chat-thread">',
    '      @for (message of messages; track $index) {',
    '        <div class="chat-row" [class.chat-row--mine]="message.fromMe">',
    '          @if (!message.fromMe) {',
    '            <gog-skeleton shape="circle" size="xsm" />',
    '          }',
    '          <gog-skeleton shape="rect" size="sm" [width]="message.width" />',
    '        </div>',
    '      }',
    '    </div>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly messages: ChatMessage[] = [',
    "    { fromMe: false, width: '55%' },",
    "    { fromMe: true, width: '38%' },",
    "    { fromMe: false, width: '68%' },",
    '  ];',
    '}',
  ].join('\n');

  protected reloadProfile(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }

    this.profileLoading.set(true);
    this.profileTimer = setTimeout(() => {
      this.profileLoading.set(false);
      this.profileTimer = null;
    }, 1800);
  }

  protected toggleProductsLoading(): void {
    this.productsLoading.update((loading) => !loading);
  }

  protected toggleChatLoading(): void {
    this.chatLoading.update((loading) => !loading);
  }

  ngOnDestroy(): void {
    if (this.profileTimer) {
      clearTimeout(this.profileTimer);
    }
  }
}
