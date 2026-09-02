import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'open',
    type: 'boolean (model)',
    default: 'false',
    description:
      'Two-way bindable open state via [(open)]. Bind it directly to drive the panel from outside — no trigger required.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      "Blocks toggle() and the trigger's click handler. Programmatic [open] writes still work.",
  },
  {
    name: 'collapseOnFocusOut',
    type: 'boolean',
    default: 'false',
    description:
      'Closes the panel once focus leaves both the trigger and the content — Tabbing past the last focusable element inside, or a click landing elsewhere on the page. Off by default, since plenty of consumers (an FAQ list, a settings section read top to bottom) want the panel to stay open regardless of where focus goes next.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on the gogCollapsibleTrigger element. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const DIRECTIVES: readonly { name: string; selector: string; description: string }[] = [
  {
    name: 'GogCollapsibleTriggerDirective',
    selector: '[gogCollapsibleTrigger]',
    description:
      "Marks the element that toggles the collapsible on click — any clickable element, not just a <button>. Wires aria-expanded, aria-controls and (when disabled) aria-disabled onto whatever it's placed on.",
  },
  {
    name: 'GogCollapsibleContentDirective',
    selector: '[gogCollapsibleContent]',
    description:
      "Marks the element the collapsible shows and hides. Wires id, aria-hidden and inert onto whatever it's placed on — that element owns its own markup and layout.",
  },
];

@Component({
  selector: 'app-collapsible-doc-page',
  imports: [
    ButtonComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
    GlobalConfigNote,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './collapsible-doc-page.html',
  styleUrl: './collapsible-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly directives = DIRECTIVES;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'collapsible')?.tokens ?? [];

  protected readonly basicOpen = signal(false);
  protected readonly disabledOpen = signal(false);
  protected readonly controlledOpen = signal(false);
  protected readonly focusOutOpen = signal(false);

  protected readonly focusOutHtml = [
    '<gog-collapsible [(open)]="open" [collapseOnFocusOut]="true">',
    '  <button type="button" gogCollapsibleTrigger>Filters</button>',
    '  <div gogCollapsibleContent>',
    '    <p>Tab forward from here and the panel closes behind you.</p>',
    '    <gog-button variant="outline">A focusable control</gog-button>',
    '  </div>',
    '</gog-collapsible>',
  ].join('\n');
  protected readonly focusOutTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  ButtonComponent,',
    '  CollapsibleComponent,',
    '  GogCollapsibleContentDirective,',
    '  GogCollapsibleTriggerDirective,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [',
    '    ButtonComponent,',
    '    CollapsibleComponent,',
    '    GogCollapsibleTriggerDirective,',
    '    GogCollapsibleContentDirective,',
    '  ],',
    '  template: `',
    '    <gog-collapsible [(open)]="open" [collapseOnFocusOut]="true">',
    '      <button type="button" gogCollapsibleTrigger>Filters</button>',
    '      <div gogCollapsibleContent>',
    '        <gog-button variant="outline">A focusable control</gog-button>',
    '      </div>',
    '    </gog-collapsible>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly open = signal(false);',
    '}',
  ].join('\n');

  protected readonly faqItems = signal([
    {
      id: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Ships within 2 business days via standard courier.',
      open: false,
    },
    {
      id: 'returns',
      question: 'What is the return policy?',
      answer: 'Free returns within 30 days of delivery.',
      open: false,
    },
    {
      id: 'warranty',
      question: 'Is there a warranty?',
      answer: 'One year, covering manufacturing defects.',
      open: false,
    },
  ]);

  protected readonly importSnippet =
    "```typescript\nimport {\n  CollapsibleComponent,\n  GogCollapsibleTriggerDirective,\n  GogCollapsibleContentDirective,\n} from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-collapsible [(open)]="open">',
    '  <button type="button" gogCollapsibleTrigger>',
    "    {{ open() ? 'Hide details' : 'Show details' }}",
    '  </button>',
    '  <p gogCollapsibleContent>Ships within 2 business days via standard courier.</p>',
    '</gog-collapsible>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  CollapsibleComponent,',
    '  GogCollapsibleTriggerDirective,',
    '  GogCollapsibleContentDirective,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],',
    '  template: `',
    '    <gog-collapsible [(open)]="open">',
    '      <button type="button" gogCollapsibleTrigger>',
    "        {{ open() ? 'Hide details' : 'Show details' }}",
    '      </button>',
    '      <p gogCollapsibleContent>Ships within 2 business days via standard courier.</p>',
    '    </gog-collapsible>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly open = signal(false);',
    '}',
  ].join('\n');

  protected readonly customTriggerHtml = [
    '<gog-collapsible [(open)]="open">',
    '  <button type="button" class="card-header" gogCollapsibleTrigger>',
    '    <span>Order #4471</span>',
    "    <gog-icon [name]=\"open() ? 'chevron-up' : 'chevron-down'\" />",
    '  </button>',
    '  <div gogCollapsibleContent class="card-body">',
    '    <p>3 items — shipped Aug 4, arriving Aug 6.</p>',
    '  </div>',
    '</gog-collapsible>',
  ].join('\n');
  protected readonly customTriggerCss = [
    '/* A <button>, so the trigger has a tab stop and answers Enter/Space — the directive',
    '   supplies neither. Which is why everything a <button> brings with it is reset here:',
    '   nothing about this should look like one. */',
    '.card-header {',
    '  display: flex;',
    '  width: 100%;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 12px 16px;',
    '  border: 1px solid var(--gog-border-color);',
    '  border-radius: var(--gog-radius);',
    '  background: var(--gog-surface-color);',
    '  color: var(--gog-text-color);',
    '  font: inherit;',
    '  font-weight: 600;',
    '  text-align: left;',
    '  cursor: pointer;',
    '}',
    '',
    '.card-header:hover {',
    '  color: var(--gog-accent-color);',
    '}',
    '',
    '.card-header:focus-visible {',
    '  outline: var(--gog-focus-ring-width) solid var(--gog-focus-ring-color);',
    '  outline-offset: 2px;',
    '}',
    '',
    '.card-body {',
    '  padding: 12px 16px;',
    '  color: var(--gog-muted-text-color);',
    '}',
  ].join('\n');
  protected readonly customTriggerTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  CollapsibleComponent,',
    '  GogCollapsibleTriggerDirective,',
    '  GogCollapsibleContentDirective,',
    '  IconComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [',
    '    CollapsibleComponent,',
    '    GogCollapsibleTriggerDirective,',
    '    GogCollapsibleContentDirective,',
    '    IconComponent,',
    '  ],',
    '  template: `',
    '    <gog-collapsible [(open)]="open">',
    '      <button type="button" class="card-header" gogCollapsibleTrigger>',
    '        <span>Order #4471</span>',
    "        <gog-icon [name]=\"open() ? 'chevron-up' : 'chevron-down'\" />",
    '      </button>',
    '      <div gogCollapsibleContent class="card-body">',
    '        <p>3 items — shipped Aug 4, arriving Aug 6.</p>',
    '      </div>',
    '    </gog-collapsible>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly open = signal(false);',
    '}',
  ].join('\n');

  protected readonly disabledHtml = [
    '<gog-collapsible [(open)]="open" [disabled]="true">',
    '  <button type="button" gogCollapsibleTrigger>Unavailable section</button>',
    '  <p gogCollapsibleContent>You should never see this — the trigger is inert.</p>',
    '</gog-collapsible>',
  ].join('\n');
  protected readonly disabledTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  CollapsibleComponent,',
    '  GogCollapsibleTriggerDirective,',
    '  GogCollapsibleContentDirective,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],',
    '  template: `',
    '    <gog-collapsible [(open)]="open" [disabled]="true">',
    '      <button type="button" gogCollapsibleTrigger>Unavailable section</button>',
    '      <p gogCollapsibleContent>You should never see this — the trigger is inert.</p>',
    '    </gog-collapsible>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly open = signal(false);',
    '}',
  ].join('\n');

  protected readonly controlledHtml = [
    '<gog-button (gogClick)="open.set(true)">Open</gog-button>',
    '<gog-button (gogClick)="open.set(false)">Close</gog-button>',
    '',
    '<gog-collapsible [(open)]="open">',
    '  <p gogCollapsibleContent>No gogCollapsibleTrigger anywhere — [open] is driven entirely from outside.</p>',
    '</gog-collapsible>',
  ].join('\n');
  protected readonly controlledTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent, CollapsibleComponent, GogCollapsibleContentDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, CollapsibleComponent, GogCollapsibleContentDirective],',
    '  template: `',
    '    <gog-button (gogClick)="open.set(true)">Open</gog-button>',
    '    <gog-button (gogClick)="open.set(false)">Close</gog-button>',
    '',
    '    <gog-collapsible [(open)]="open">',
    '      <p gogCollapsibleContent>No gogCollapsibleTrigger anywhere — [open] is driven entirely from outside.</p>',
    '    </gog-collapsible>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly open = signal(false);',
    '}',
  ].join('\n');

  protected readonly faqHtml = [
    '@for (item of faqItems(); track item.id) {',
    '  <gog-collapsible [open]="item.open" (openChange)="setFaqOpen(item.id, $event)">',
    '    <button type="button" gogCollapsibleTrigger>{{ item.question }}</button>',
    '    <p gogCollapsibleContent>{{ item.answer }}</p>',
    '  </gog-collapsible>',
    '}',
  ].join('\n');
  protected readonly faqTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  CollapsibleComponent,',
    '  GogCollapsibleTriggerDirective,',
    '  GogCollapsibleContentDirective,',
    "} from '@guildofgleks/ui';",
    '',
    'interface FaqItem {',
    '  id: string;',
    '  question: string;',
    '  answer: string;',
    '  open: boolean;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],',
    '  template: `',
    '    @for (item of faqItems(); track item.id) {',
    '      <gog-collapsible [open]="item.open" (openChange)="setOpen(item.id, $event)">',
    '        <button type="button" gogCollapsibleTrigger>{{ item.question }}</button>',
    '        <p gogCollapsibleContent>{{ item.answer }}</p>',
    '      </gog-collapsible>',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly faqItems = signal<FaqItem[]>([',
    "    { id: 'shipping', question: 'How long does shipping take?', answer: '2 business days.', open: false },",
    "    { id: 'returns', question: 'What is the return policy?', answer: '30 days, free.', open: false },",
    '  ]);',
    '',
    '  protected setOpen(id: string, open: boolean): void {',
    '    this.faqItems.update((items) =>',
    '      items.map((item) => (item.id === id ? { ...item, open } : item)),',
    '    );',
    '  }',
    '}',
  ].join('\n');

  protected setFaqOpen(id: string, open: boolean): void {
    this.faqItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, open } : item)),
    );
  }
}
