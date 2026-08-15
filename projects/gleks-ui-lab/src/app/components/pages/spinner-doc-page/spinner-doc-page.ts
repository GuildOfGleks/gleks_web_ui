import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize, GogSpinnerVariant } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { SPINNER_EXAMPLE_SOURCES } from '../../../examples/spinner/sources.generated';
import { SpinnerColorExample } from '../../../examples/spinner/spinner-color/example';
import { SpinnerCustomVariantExample } from '../../../examples/spinner/spinner-custom-variant/example';
import { SpinnerFullscreenExample } from '../../../examples/spinner/spinner-fullscreen/example';
import { SpinnerOverlayExample } from '../../../examples/spinner/spinner-overlay/example';
import { SpinnerOverviewExample } from '../../../examples/spinner/spinner-overview/example';
import { SpinnerSizesExample } from '../../../examples/spinner/spinner-sizes/example';
import { SpinnerSpeedExample } from '../../../examples/spinner/spinner-speed/example';
import { SpinnerVariantsExample } from '../../../examples/spinner/spinner-variants/example';

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
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(SPINNER_EXAMPLE_SOURCES)],
  templateUrl: './spinner-doc-page.html',
  styleUrl: './spinner-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly variants: GogSpinnerVariant[] = ['runic', 'ring'];

  protected readonly spinnerApiInputs = SPINNER_API_INPUTS;
  protected readonly spinnerOverlayApiInputs = SPINNER_OVERLAY_API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'spinner')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SpinnerComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/spinner/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    color: SpinnerColorExample,
    customVariant: SpinnerCustomVariantExample,
    fullscreen: SpinnerFullscreenExample,
    overlay: SpinnerOverlayExample,
    overview: SpinnerOverviewExample,
    sizes: SpinnerSizesExample,
    speed: SpinnerSpeedExample,
    variants: SpinnerVariantsExample,
  };
}
