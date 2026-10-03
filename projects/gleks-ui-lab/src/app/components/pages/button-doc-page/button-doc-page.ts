import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { BUTTON_EXAMPLES } from '../../../examples/button/sources.generated';
import { ButtonAriaStateExample } from '../../../examples/button/button-aria-state/example';
import { ButtonDebounceExample } from '../../../examples/button/button-debounce/example';
import { ButtonDisabledExample } from '../../../examples/button/button-disabled/example';
import { ButtonFullWidthExample } from '../../../examples/button/button-full-width/example';
import { ButtonIconsExample } from '../../../examples/button/button-icons/example';
import { ButtonLinkExample } from '../../../examples/button/button-link/example';
import { ButtonLoadingExample } from '../../../examples/button/button-loading/example';
import { ButtonNativeTypeExample } from '../../../examples/button/button-native-type/example';
import { ButtonOverviewExample } from '../../../examples/button/button-overview/example';
import { ButtonPressExample } from '../../../examples/button/button-press/example';
import { ButtonSeverityExample } from '../../../examples/button/button-severity/example';
import { ButtonVariantsExample } from '../../../examples/button/button-variants/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost'",
    default: "'primary'",
    description: 'Visual style of the button.',
  },
  {
    name: 'severity',
    type: "'accent' | 'success' | 'danger' | 'warning' | 'info'",
    default: "'accent'",
    description:
      'What the action means, as opposed to how loudly it is drawn. Orthogonal to variant, so every combination is real: a ghost delete is still a delete. accent is the absence of a claim and leaves the button exactly as it was.',
    since: '21.9.0',
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
      'Shows a spinner in place of the label and blocks activation — including a type="submit" button\'s form submission. Uses aria-disabled rather than the native disabled attribute, so the button stays focusable, and keeps its label in the accessible name (hidden with opacity, not visibility) so it still reads as "Save".',
  },
  {
    name: 'debounce',
    type: 'number',
    default: '300',
    description:
      'Minimum time, in ms, between accepted clicks. Leading-edge throttle: the first click fires immediately, further clicks are dropped until the window elapses. A dropped click is cancelled, so on a type="submit" button it does not submit the form either.',
  },
  {
    name: 'ariaLabel',
    type: 'string | null',
    default: 'null',
    description:
      'Accessible name forwarded to the native <button>. Required for icon-only buttons — a plain aria-label attribute on <gog-button> lands on the host element, not the inner button, so assistive tech never sees it.',
  },
  {
    name: 'ariaPressed',
    type: "boolean | 'mixed' | null",
    default: 'null',
    description:
      'Marks the button as a toggle and reports its state. null omits the attribute entirely; false renders aria-pressed="false", which is what an off toggle has to say — a button with no aria-pressed is not a toggle button.',
    since: '21.8.0',
  },
  {
    name: 'ariaExpanded',
    type: 'boolean | null',
    default: 'null',
    description:
      'For a disclosure or popup trigger: whether the thing it controls is currently open. Like ariaPressed, false is a real state and null means "this button expands nothing".',
    since: '21.8.0',
  },
  {
    name: 'ariaControls',
    type: 'string | null',
    default: 'null',
    description:
      'Id of the element this button controls. Pairs with ariaExpanded; point it at an element that is actually in the document.',
    since: '21.8.0',
  },
  {
    name: 'ariaHasPopup',
    type: 'GogAriaHasPopup | null',
    default: 'null',
    description:
      "boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' — what kind of popup the button opens.",
    since: '21.8.0',
  },
  {
    name: 'ariaCurrent',
    type: 'GogAriaCurrent | null',
    default: 'null',
    description:
      "Marks the current item of a set — 'page', 'step', 'location', 'date', 'time', or true — on the inner <button>. Set it on that one button only; null omits the attribute. gog-paginator uses it for its current page.",
    since: '21.15.0',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on the inner <button>. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const DIRECTIVE_INPUTS: readonly ApiRow[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost'",
    default: "'primary'",
    description: 'Visual style — the same four the component offers.',
  },
  {
    name: 'severity',
    type: "'accent' | 'success' | 'danger' | 'warning' | 'info'",
    default: "'accent'",
    description:
      'What the action means, as opposed to how loudly it is drawn. Orthogonal to variant, so every combination is real: a ghost delete is still a delete. accent is the absence of a claim. The same input the component takes.',
    since: '21.9.0',
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
    description: 'Stretches the element to fill its container.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogClick',
    type: 'MouseEvent',
    description:
      'Emitted on each accepted click — after debounce throttling, and never while loading.',
  },
];

@Component({
  selector: 'app-button-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './button-doc-page.html',
  styleUrl: './button-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly directiveInputs = DIRECTIVE_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button')?.tokens ?? [];

  protected readonly sources = BUTTON_EXAMPLES;
  protected readonly examples = {
    overview: ButtonOverviewExample,
    variants: ButtonVariantsExample,
    severity: ButtonSeverityExample,
    press: ButtonPressExample,
    disabled: ButtonDisabledExample,
    loading: ButtonLoadingExample,
    fullWidth: ButtonFullWidthExample,
    icons: ButtonIconsExample,
    ariaState: ButtonAriaStateExample,
    debounce: ButtonDebounceExample,
    nativeType: ButtonNativeTypeExample,
    link: ButtonLinkExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ButtonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonComponent],\n})\n```";

  protected readonly directiveImportSnippet =
    "```typescript\nimport { GogButtonDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogButtonDirective],\n})\n```";

  protected readonly pressThemeSnippet = [
    '```css',
    ':root {',
    '  /* Every primary button, pressed. One token per variant. */',
    '  --gog-button-primary-press-bg: #7a1d1d;',
    '  /* The press movement; 1 removes it, everywhere. */',
    '  --gog-button-active-scale: 1;',
    '}',
    '```',
  ].join('\n');
}
