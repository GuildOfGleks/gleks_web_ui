import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { provideExampleSources } from '../../shared/example-sources';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { BUTTON_EXAMPLE_SOURCES } from '../../../examples/button/sources.generated';
import { ButtonBasicExample } from '../../../examples/button/button-basic.example';
import { ButtonDebounceExample } from '../../../examples/button/button-debounce.example';
import { ButtonDisabledExample } from '../../../examples/button/button-disabled.example';
import { ButtonFormTypeExample } from '../../../examples/button/button-form-type.example';
import { ButtonFullWidthExample } from '../../../examples/button/button-full-width.example';
import { ButtonIconOnlyExample } from '../../../examples/button/button-icon-only.example';
import { ButtonLinkExample } from '../../../examples/button/button-link.example';
import { ButtonLoadingExample } from '../../../examples/button/button-loading.example';
import { ButtonVariantsExample } from '../../../examples/button/button-variants.example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost'",
    default: "'primary'",
    description: 'Visual style of the button.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Button size.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Fully non-interactive: excluded from tab order via the native disabled attribute.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the button to fill its container.',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Forwarded to the native <button> type attribute.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Shows a spinner in place of the label and blocks activation. Uses aria-disabled rather than the native disabled attribute, so the button stays focusable.',
  },
  {
    name: 'debounce',
    type: 'number',
    default: '300',
    description:
      'Minimum time, in ms, between accepted clicks. Leading-edge throttle: the first click fires immediately, further clicks are dropped until the window elapses.',
  },
  {
    name: 'ariaLabel',
    type: 'string | null',
    default: 'null',
    description:
      'Accessible name forwarded to the native <button>. Required for icon-only buttons — a plain aria-label attribute on <gog-button> lands on the host element, not the inner button, so assistive tech never sees it.',
  },
];

const DIRECTIVE_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost'",
    default: "'primary'",
    description: 'Visual style — the same four the component offers.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Also settable app-wide via GOG_CONFIG.control.size.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the element to fill its container. A bare attribute works.',
  },
];

@Component({
  selector: 'app-button-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  // Every `<app-example>` on this page resolves its source text from here — one provider per
  // page, and the examples themselves are named exactly once, in the template.
  providers: [provideExampleSources(BUTTON_EXAMPLE_SOURCES)],
  templateUrl: './button-doc-page.html',
  styleUrl: './button-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly directiveInputs = DIRECTIVE_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button')?.tokens ?? [];

  /**
   * The page's examples, each a real component under `src/app/examples/button/`. The demo, the
   * code shown under it and the project StackBlitz boots all come from that one file — see
   * `docs/lab-examples-refactor.md`.
   */
  protected readonly examples = {
    basic: ButtonBasicExample,
    variants: ButtonVariantsExample,
    disabled: ButtonDisabledExample,
    loading: ButtonLoadingExample,
    fullWidth: ButtonFullWidthExample,
    iconOnly: ButtonIconOnlyExample,
    debounce: ButtonDebounceExample,
    formType: ButtonFormTypeExample,
    link: ButtonLinkExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ButtonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonComponent],\n})\n```";

  protected readonly directiveImportSnippet =
    "```typescript\nimport { GogButtonDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogButtonDirective],\n})\n```";
}
