import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { SPINNER_EXAMPLES } from '../../../examples/spinner/sources.generated';
import { SpinnerColorExample } from '../../../examples/spinner/spinner-color/example';
import { SpinnerConfigExample } from '../../../examples/spinner/spinner-config/example';
import { SpinnerFullscreenExample } from '../../../examples/spinner/spinner-fullscreen/example';
import { SpinnerOverviewExample } from '../../../examples/spinner/spinner-overview/example';
import { SpinnerRegionExample } from '../../../examples/spinner/spinner-region/example';
import { SpinnerSizesExample } from '../../../examples/spinner/spinner-sizes/example';
import { SpinnerSpeedExample } from '../../../examples/spinner/spinner-speed/example';

const SPINNER_API_INPUTS: readonly ApiRow[] = [
  {
    name: 'variant',
    type: "'runic' | 'ring' | 'custom'",
    default: 'unset',
    description:
      'runic and ring are built-in presets. custom renders your own markup via content projection — it inherits the size wrapper, overlay behavior, and --gog-spinner-color theming, but the visuals are yours. Left unset, this falls through to GOG_CONFIG.spinner.component, then to GOG_CONFIG.spinner.variant, then to runic.',
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
    description:
      'Names the spinner, which is an indeterminate role="progressbar" — read as progressbar "Loading". ariaLabel="" makes it decorative: no role, no name. Before 21.15.0 the input was accepted and never rendered, so every spinner was invisible to assistive tech.',
  },
];

const SPINNER_OVERLAY_API_INPUTS: readonly ApiRow[] = [
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a scrim + spinner over the projected content while true.',
  },
  {
    name: 'variant',
    type: "'runic' | 'ring' | 'custom' | undefined",
    default: 'unset',
    description:
      'Forwarded to the inner gog-spinner, and unset by default so that "asked for nothing" survives the trip: an overlay that names no variant lets GOG_CONFIG.spinner.component or .variant through, exactly as a bare gog-spinner does. It defaulted to runic until 21.10.0, which the inner spinner read as an explicit request — so a configured house spinner appeared everywhere except here.',
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
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './spinner-doc-page.html',
  styleUrl: './spinner-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerDocPage {
  protected readonly spinnerInputs = SPINNER_API_INPUTS;
  protected readonly overlayInputs = SPINNER_OVERLAY_API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'spinner')?.tokens ?? [];

  protected readonly sources = SPINNER_EXAMPLES;
  protected readonly examples = {
    overview: SpinnerOverviewExample,
    sizes: SpinnerSizesExample,
    speed: SpinnerSpeedExample,
    color: SpinnerColorExample,
    config: SpinnerConfigExample,
    region: SpinnerRegionExample,
    fullscreen: SpinnerFullscreenExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { SpinnerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [SpinnerComponent],\n})\n```";
}
