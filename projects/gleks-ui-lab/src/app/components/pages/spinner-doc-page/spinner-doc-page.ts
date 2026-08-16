import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogSize,
  GogSpinnerVariant,
  SpinnerComponent,
  SpinnerOverlayComponent,
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

const SPINNER_API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'variant',
    type: "'runic' | 'ring' | 'custom'",
    default: "'runic'",
    description:
      'runic and ring are built-in presets. custom renders your own markup via content projection — it inherits the size wrapper, overlay behavior, and --gog-spinner-color theming, but the visuals are yours.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Wrapper and glyph size.',
  },
  {
    name: 'overlay',
    type: 'boolean',
    default: 'false',
    description:
      'Renders as a fixed, viewport-covering overlay. Distinct from gog-spinner-overlay below, which only covers its own content.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Loading'",
    description: 'Accessible name announced to assistive tech.',
  },
];

const SPINNER_OVERLAY_API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a scrim + spinner over the projected content while true.',
  },
  {
    name: 'variant',
    type: "'runic' | 'ring' | 'custom'",
    default: "'runic'",
    description: 'Forwarded to the inner gog-spinner.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Forwarded to the inner gog-spinner.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Loading'",
    description: 'Forwarded to the inner gog-spinner.',
  },
];

@Component({
  selector: 'app-spinner-doc-page',
  imports: [
    SpinnerComponent,
    SpinnerOverlayComponent,
    ButtonComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './spinner-doc-page.html',
  styleUrl: './spinner-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerDocPage implements OnDestroy {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];

  protected readonly spinnerApiInputs = SPINNER_API_INPUTS;
  protected readonly spinnerOverlayApiInputs = SPINNER_OVERLAY_API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'spinner')?.tokens ?? [];

  protected readonly showOverlay = signal(false);
  protected readonly showFullscreenOverlay = signal(false);
  private overlayTimer: ReturnType<typeof setTimeout> | null = null;
  private fullscreenTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly importSnippet =
    "```typescript\nimport { SpinnerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SpinnerComponent],\n})\n```";

  protected readonly overviewHtml = '<gog-spinner ariaLabel="Loading" />';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `<gog-spinner ariaLabel="Loading" />`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-spinner [size]="sizeOption" [ariaLabel]="\'Loading \' + sizeOption" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component } from '@angular/core';",
    "import { GogSize, SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-spinner [size]="sizeOption" [ariaLabel]="\'Loading \' + sizeOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');

  protected readonly variantsHtml = [
    '@for (variantOption of variants; track variantOption) {',
    '  <gog-spinner [variant]="variantOption" size="lg" [ariaLabel]="\'Loading, \' + variantOption + \' variant\'" />',
    '}',
  ].join('\n');
  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { GogSpinnerVariant, SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    @for (variantOption of variants; track variantOption) {',
    '      <gog-spinner [variant]="variantOption" size="lg" [ariaLabel]="\'Loading, \' + variantOption + \' variant\'" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];",
    '}',
  ].join('\n');

  protected readonly speedHtml = [
    '<gog-spinner size="lg" style="--gog-spinner-spin-duration: 2.4s" ariaLabel="Loading, slow" />',
    '<gog-spinner size="lg" style="--gog-spinner-spin-duration: 0.5s" ariaLabel="Loading, fast" />',
  ].join('\n');
  protected readonly speedTs = [
    "import { Component } from '@angular/core';",
    "import { SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 2.4s" ariaLabel="Loading, slow" />',
    '    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 0.5s" ariaLabel="Loading, fast" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly customVariantHtml = [
    '<gog-spinner variant="custom" size="lg" ariaLabel="Loading, custom variant">',
    '  <div class="dots-loader">',
    '    <span></span><span></span><span></span>',
    '  </div>',
    '</gog-spinner>',
  ].join('\n');
  protected readonly customVariantTs = [
    "import { Component } from '@angular/core';",
    "import { SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    <gog-spinner variant="custom" size="lg" ariaLabel="Loading, custom variant">',
    '      <div class="dots-loader">',
    '        <span></span><span></span><span></span>',
    '      </div>',
    '    </gog-spinner>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');
  protected readonly customVariantCss = [
    '/* Fills the size wrapper the component supplies, so `size` still drives how big this is. */',
    '.dots-loader {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 8px;',
    '  width: 100%;',
    '  height: 100%;',
    '}',
    '',
    '/* Reading --gog-spinner-color means a custom variant still answers a recolour the same',
    "   way the built-in ones do, and falls back to the theme's accent when nobody sets it. */",
    '.dots-loader span {',
    '  width: 22%;',
    '  aspect-ratio: 1;',
    '  border-radius: 50%;',
    '  background: var(--gog-spinner-color, var(--gog-accent-color));',
    '  animation: dots-bounce 0.9s ease-in-out infinite;',
    '}',
    '',
    '.dots-loader span:nth-child(2) {',
    '  animation-delay: 0.15s;',
    '}',
    '',
    '.dots-loader span:nth-child(3) {',
    '  animation-delay: 0.3s;',
    '}',
    '',
    '@keyframes dots-bounce {',
    '  0%,',
    '  80%,',
    '  100% {',
    '    transform: scale(0.6);',
    '    opacity: 0.5;',
    '  }',
    '  40% {',
    '    transform: scale(1);',
    '    opacity: 1;',
    '  }',
    '}',
    '',
    '/* The library disables its own animations under this query; a custom variant has to do it',
    '   itself, or it becomes the one moving thing left on the page. */',
    '@media (prefers-reduced-motion: reduce) {',
    '  .dots-loader span {',
    '    animation: none;',
    '  }',
    '}',
  ].join('\n');

  protected readonly colorHtml = [
    '<gog-spinner ariaLabel="Loading, danger color" style="--gog-spinner-color: var(--gog-danger-color)" />',
    '<gog-spinner ariaLabel="Loading, success color" style="--gog-spinner-color: var(--gog-success-color)" />',
  ].join('\n');
  protected readonly colorTs = [
    "import { Component } from '@angular/core';",
    "import { SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    <gog-spinner ariaLabel="Loading, danger color" style="--gog-spinner-color: var(--gog-danger-color)" />',
    '    <gog-spinner ariaLabel="Loading, success color" style="--gog-spinner-color: var(--gog-success-color)" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly overlayHtml = [
    '<gog-spinner-overlay [loading]="loading()" size="lg" variant="ring" ariaLabel="Loading content">',
    '  <div class="panel"><!-- any content --></div>',
    '</gog-spinner-overlay>',
  ].join('\n');
  protected readonly overlayTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SpinnerOverlayComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerOverlayComponent],',
    '  template: `',
    '    <gog-spinner-overlay [loading]="loading()" size="lg" variant="ring" ariaLabel="Loading content">',
    '      <div class="panel"><!-- any content --></div>',
    '    </gog-spinner-overlay>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly loading = signal(true);',
    '}',
  ].join('\n');

  protected readonly fullscreenHtml =
    '@if (loading()) {\n  <gog-spinner [overlay]="true" size="lg" ariaLabel="Loading page" />\n}';
  protected readonly fullscreenTs = [
    "import { Component, signal } from '@angular/core';",
    "import { SpinnerComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [SpinnerComponent],',
    '  template: `',
    '    @if (loading()) {',
    '      <gog-spinner [overlay]="true" size="lg" ariaLabel="Loading page" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly loading = signal(true);',
    '}',
  ].join('\n');

  protected previewOverlay(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }

    this.showOverlay.set(true);
    this.overlayTimer = setTimeout(() => {
      this.showOverlay.set(false);
      this.overlayTimer = null;
    }, 1500);
  }

  protected previewFullscreenOverlay(): void {
    if (this.fullscreenTimer) {
      clearTimeout(this.fullscreenTimer);
    }

    this.showFullscreenOverlay.set(true);
    this.fullscreenTimer = setTimeout(() => {
      this.showFullscreenOverlay.set(false);
      this.fullscreenTimer = null;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }
    if (this.fullscreenTimer) {
      clearTimeout(this.fullscreenTimer);
    }
  }
}
