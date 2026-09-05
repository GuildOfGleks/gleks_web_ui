import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogButtonDirective,
  GogSeverity,
  GogSize,
  GogVariant,
  IconComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
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
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on the inner <button>. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
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
    description: 'Stretches the element to fill its container. A bare attribute works.',
  },
];

@Component({
  selector: 'app-button-doc-page',
  imports: [
    ButtonComponent,
    GogButtonDirective,
    IconComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './button-doc-page.html',
  styleUrl: './button-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDocPage {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly severities: GogSeverity[] = ['success', 'danger', 'warning', 'info'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly directiveInputs = DIRECTIVE_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button')?.tokens ?? [];

  protected readonly directiveImportSnippet =
    "```typescript\nimport { GogButtonDirective } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [GogButtonDirective],\n})\n```";

  protected readonly directiveHtml = [
    '<a gogButton routerLink="/general/theming">See theming</a>',
    '<a gogButton variant="ghost" href="https://example.com" target="_blank" rel="noreferrer">',
    '  Docs',
    '</a>',
    '<button gogButton variant="outline" size="sm" type="submit">Save</button>',
    '<a gogButton fullWidth routerLink="/components/table">Checkout</a>',
  ].join('\n');
  protected readonly directiveTs = [
    "import { Component } from '@angular/core';",
    "import { RouterLink } from '@angular/router';",
    "import { GogButtonDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [GogButtonDirective, RouterLink],',
    '  template: `',
    '    <a gogButton routerLink="/pricing">See pricing</a>',
    '    <button gogButton variant="outline" size="sm" type="submit">Save</button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly isMirrored = signal(false);
  protected readonly areFiltersOpen = signal(false);

  protected readonly isLoading = signal(false);
  protected readonly lastClicked = signal('No button clicked yet.');
  protected readonly clickCount = signal(0);
  protected readonly formResult = signal('Neither button pressed yet.');

  protected readonly loadingBySize: Record<GogSize, ReturnType<typeof signal<boolean>>> = {
    xsm: signal(false),
    sm: signal(false),
    md: signal(false),
    lg: signal(false),
    slg: signal(false),
  };

  protected readonly importSnippet =
    "```typescript\nimport { ButtonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonComponent],\n})\n```";

  protected readonly overviewHtml =
    '<gog-button variant="primary" (gogClick)="onClick($event)">\n  Click me\n</gog-button>';
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button variant="primary" (gogClick)="onClick($event)">',
    '      Click me',
    '    </gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  onClick(event: MouseEvent): void {',
    "    console.log('Clicked', event);",
    '  }',
    '}',
  ].join('\n');

  protected readonly variantsHtml = [
    '<gog-button variant="primary" size="md">Primary</gog-button>',
    '<gog-button variant="secondary" size="md">Secondary</gog-button>',
    '<gog-button variant="outline" size="md">Outline</gog-button>',
    '<gog-button variant="ghost" size="md">Ghost</gog-button>',
  ].join('\n');
  protected readonly severityHtml = [
    '@for (severity of severities; track severity) {',
    '  @for (variant of variants; track variant) {',
    '    <gog-button [variant]="variant" [severity]="severity">{{ variant }}</gog-button>',
    '  }',
    '}',
  ].join('\n');
  protected readonly severityTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, GogSeverity, GogVariant } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button severity="danger" (gogClick)="deleteAccount()">Delete account</gog-button>',
    '    <gog-button variant="outline" severity="warning">Discard draft</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];",
    "  protected readonly severities: GogSeverity[] = ['success', 'danger', 'warning', 'info'];",
    '}',
  ].join('\n');

  protected readonly variantsTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button variant="primary" size="md">Primary</gog-button>',
    '    <gog-button variant="secondary" size="md">Secondary</gog-button>',
    '    <gog-button variant="outline" size="md">Outline</gog-button>',
    '    <gog-button variant="ghost" size="md">Ghost</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly pressHtml = [
    '<!-- Nothing to wire up: every variant presses. The tokens are the knobs. -->',
    '<gog-button variant="primary">primary</gog-button>',
    '',
    '<!-- One instance, its own press colour -->',
    '<gog-button',
    '  variant="primary"',
    '  style="--gog-button-press-bg: var(--gog-danger-color); --gog-button-press-color: #fff"',
    '>',
    '  primary',
    '</gog-button>',
  ].join('\n');
  protected readonly pressTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  // A theme sets the same thing for every button of a variant:',
    '  //   --gog-button-primary-active-bg: #7a1d1d;',
    '  // and --gog-button-active-scale retimes or removes the movement, app-wide.',
    '  template: `<gog-button variant="primary">primary</gog-button>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly disabledHtml =
    '<gog-button variant="primary" [disabled]="true">Primary</gog-button>';
  protected readonly disabledTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button variant="primary" [disabled]="true">Primary</gog-button>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly loadingHtml = [
    '<gog-button',
    '  variant="primary"',
    '  [loading]="isLoading()"',
    '  (gogClick)="simulateLoading()"',
    '>',
    '  Simulate loading',
    '</gog-button>',
  ].join('\n');
  protected readonly loadingTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button',
    '      variant="primary"',
    '      [loading]="isLoading()"',
    '      (gogClick)="simulateLoading()"',
    '    >',
    '      Simulate loading',
    '    </gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly isLoading = signal(false);',
    '',
    '  protected simulateLoading(): void {',
    '    this.isLoading.set(true);',
    '    setTimeout(() => this.isLoading.set(false), 1500);',
    '  }',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml =
    '<gog-button variant="outline" [fullWidth]="true">Full width</gog-button>';
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button variant="outline" [fullWidth]="true">Full width</gog-button>`,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly iconOnlyHtml = [
    '<gog-button variant="primary" ariaLabel="Confirm">',
    '  <gog-icon name="check" />',
    '</gog-button>',
  ].join('\n');
  protected readonly iconOnlyTs = [
    "import { Component } from '@angular/core';",
    "import { ButtonComponent, IconComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, IconComponent],',
    '  template: `',
    '    <gog-button variant="primary" ariaLabel="Confirm">',
    '      <gog-icon name="check" />',
    '    </gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly ariaStateHtml = [
    '<gog-button [ariaPressed]="isMirrored()" (gogClick)="toggleMirror()">',
    '  Mirror layout',
    '</gog-button>',
    '',
    '<gog-button',
    '  [ariaExpanded]="areFiltersOpen()"',
    '  ariaControls="filters"',
    '  ariaHasPopup="dialog"',
    '  (gogClick)="toggleFilters()"',
    '>',
    '  Filters',
    '</gog-button>',
    '',
    '<div id="filters" [hidden]="!areFiltersOpen()">…</div>',
  ].join('\n');
  protected readonly ariaStateTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button [ariaPressed]="isMirrored()" (gogClick)="toggleMirror()">',
    '      Mirror layout',
    '    </gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly isMirrored = signal(false);',
    '',
    '  protected toggleMirror(): void {',
    '    this.isMirrored.update((on) => !on);',
    '  }',
    '}',
  ].join('\n');

  protected readonly debounceHtml =
    '<gog-button variant="primary" [debounce]="300" (gogClick)="onSpamClick()">Click me fast</gog-button>';
  protected readonly debounceTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button variant="primary" [debounce]="300" (gogClick)="onSpamClick()">',
    '      Click me fast',
    '    </gog-button>',
    '    <p>Accepted clicks: {{ clickCount() }}</p>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly clickCount = signal(0);',
    '',
    '  protected onSpamClick(): void {',
    '    this.clickCount.update((count) => count + 1);',
    '  }',
    '}',
  ].join('\n');

  protected readonly formHtml = [
    '<form (submit)="onFormSubmit($event)" (reset)="onFormReset()">',
    '  <gog-button variant="primary" type="submit">Submit</gog-button>',
    '  <gog-button variant="outline" type="reset">Reset</gog-button>',
    '</form>',
  ].join('\n');
  protected readonly formTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <form (submit)="onFormSubmit($event)" (reset)="onFormReset()">',
    '      <gog-button variant="primary" type="submit">Submit</gog-button>',
    '      <gog-button variant="outline" type="reset">Reset</gog-button>',
    '    </form>',
    '    <p>{{ formResult() }}</p>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly formResult = signal('Neither button pressed yet.');",
    '',
    '  protected onFormSubmit(event: Event): void {',
    '    event.preventDefault();',
    '    this.formResult.set(\'Submitted via type="submit".\');',
    '  }',
    '',
    '  protected onFormReset(): void {',
    '    this.formResult.set(\'Reset via type="reset".\');',
    '  }',
    '}',
  ].join('\n');

  protected onClick(variant: GogVariant, size: GogSize): void {
    this.lastClicked.set(`Clicked "${variant}" (${size})`);
  }

  protected simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  protected simulateLoadingFor(size: GogSize): void {
    const target = this.loadingBySize[size];
    target.set(true);
    setTimeout(() => target.set(false), 1500);
  }

  protected toggleMirror(): void {
    this.isMirrored.update((on) => !on);
  }

  protected toggleFilters(): void {
    this.areFiltersOpen.update((open) => !open);
  }

  protected onSpamClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  protected onFormSubmit(event: Event): void {
    event.preventDefault();
    this.formResult.set('Submitted via type="submit".');
  }

  protected onFormReset(): void {
    this.formResult.set('Reset via type="reset".');
  }
}
