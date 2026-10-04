import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { COLLAPSIBLE_EXAMPLES } from '../../../examples/collapsible/sources.generated';
import { CollapsibleExternalExample } from '../../../examples/collapsible/collapsible-external/example';
import { CollapsibleFocusOutExample } from '../../../examples/collapsible/collapsible-focus-out/example';
import { CollapsibleHeightExample } from '../../../examples/collapsible/collapsible-height/example';
import { CollapsibleListExample } from '../../../examples/collapsible/collapsible-list/example';
import { CollapsibleOverlayExample } from '../../../examples/collapsible/collapsible-overlay/example';
import { CollapsibleOverviewExample } from '../../../examples/collapsible/collapsible-overview/example';
import { CollapsibleStatesExample } from '../../../examples/collapsible/collapsible-states/example';
import { CollapsibleTriggerExample } from '../../../examples/collapsible/collapsible-trigger/example';

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

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'openChange',
    type: 'boolean',
    description:
      'The new open state, on a trigger press or a focus-out close. Comes from the open model input.',
  },
];

const API_DIRECTIVES: readonly ApiRow[] = [
  {
    name: '[gogCollapsibleTrigger]',
    type: 'any element inside gog-collapsible — usually a <button>',
    description:
      'Marks the element that toggles the collapsible. Wires aria-expanded, aria-controls and (when disabled) aria-disabled onto whatever it is placed on; on an element that is not a <button> it also adds role="button", tabindex="0" and Enter/Space, unless the consumer set a role or tabindex.',
  },
  {
    name: '[gogCollapsibleContent]',
    type: 'any element inside gog-collapsible',
    description:
      "Marks the element the collapsible shows and hides. Wires id, aria-hidden and inert onto whatever it's placed on — that element owns its own markup and layout.",
  },
];

@Component({
  selector: 'app-collapsible-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './collapsible-doc-page.html',
  styleUrl: './collapsible-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiDirectives = API_DIRECTIVES;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'collapsible')?.tokens ?? [];

  protected readonly sources = COLLAPSIBLE_EXAMPLES;
  protected readonly examples = {
    overview: CollapsibleOverviewExample,
    states: CollapsibleStatesExample,
    trigger: CollapsibleTriggerExample,
    height: CollapsibleHeightExample,
    overlay: CollapsibleOverlayExample,
    external: CollapsibleExternalExample,
    focusOut: CollapsibleFocusOutExample,
    list: CollapsibleListExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport {\n  CollapsibleComponent,\n  GogCollapsibleTriggerDirective,\n  GogCollapsibleContentDirective,\n} from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],\n})\n```";
}
