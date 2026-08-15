import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { COLLAPSIBLE_EXAMPLE_SOURCES } from '../../../examples/collapsible/sources.generated';
import { CollapsibleControlledExample } from '../../../examples/collapsible/collapsible-controlled/example';
import { CollapsibleCustomTriggerExample } from '../../../examples/collapsible/collapsible-custom-trigger/example';
import { CollapsibleDisabledExample } from '../../../examples/collapsible/collapsible-disabled/example';
import { CollapsibleFaqExample } from '../../../examples/collapsible/collapsible-faq/example';
import { CollapsibleFocusOutExample } from '../../../examples/collapsible/collapsible-focus-out/example';
import { CollapsibleOverviewExample } from '../../../examples/collapsible/collapsible-overview/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
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
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(COLLAPSIBLE_EXAMPLE_SOURCES)],
  templateUrl: './collapsible-doc-page.html',
  styleUrl: './collapsible-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly directives = DIRECTIVES;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'collapsible')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport {\n  CollapsibleComponent,\n  GogCollapsibleTriggerDirective,\n  GogCollapsibleContentDirective,\n} from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],\n})\n```";

  /** Each example is a file under `src/app/examples/collapsible/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    controlled: CollapsibleControlledExample,
    customTrigger: CollapsibleCustomTriggerExample,
    disabled: CollapsibleDisabledExample,
    faq: CollapsibleFaqExample,
    focusOut: CollapsibleFocusOutExample,
    overview: CollapsibleOverviewExample,
  };
}
