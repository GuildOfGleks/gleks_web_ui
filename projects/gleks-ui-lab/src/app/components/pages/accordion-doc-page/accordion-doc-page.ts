import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { ACCORDION_EXAMPLES } from '../../../examples/accordion/sources.generated';
import { AccordionControlledExample } from '../../../examples/accordion/accordion-controlled/example';
import { AccordionHeadingLevelExample } from '../../../examples/accordion/accordion-heading-level/example';
import { AccordionLoadingExample } from '../../../examples/accordion/accordion-loading/example';
import { AccordionMultiExample } from '../../../examples/accordion/accordion-multi/example';
import { AccordionOverviewExample } from '../../../examples/accordion/accordion-overview/example';
import { AccordionSizesExample } from '../../../examples/accordion/accordion-sizes/example';
import { AccordionTemplatesExample } from '../../../examples/accordion/accordion-templates/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'items',
    type: 'readonly GogAccordionItem[]',
    default: '[]',
    description: 'The sections to render. Each item needs an id and title, and may set disabled.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'lg'",
    description: 'Header/body padding, font size, and chevron size.',
  },
  {
    name: 'expandFirst',
    type: 'boolean',
    default: 'false',
    description:
      'Opens the first item once items becomes non-empty. Fires only that one time — closing everything by hand does not reopen it, even if items is later replaced.',
  },
  {
    name: 'multi',
    type: 'boolean',
    default: 'false',
    description:
      'Allows more than one item open at once. Off by default: opening an item closes the rest.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      "Renders a shimmering skeleton row per item instead of real headers — for when the item list itself hasn't arrived yet.",
  },
  {
    name: 'skeletonCount',
    type: 'number',
    default: '3',
    description:
      'How many skeleton rows to render while loading is true and items is still empty — the common case of "the list itself hasn\'t arrived yet", where there is no item count to derive a row count from. Ignored once items has entries: then one skeleton row is rendered per item, so the placeholder matches the eventual shape.',
  },
  {
    name: 'showChevron',
    type: 'boolean',
    default: 'true',
    description: 'Toggles the trailing chevron indicator.',
  },
  {
    name: 'headingLevel',
    type: '2 | 3 | 4 | 5 | 6 | undefined',
    default: 'undefined',
    description:
      'Wraps each header in role="heading" at this aria-level, so screen readers can navigate sections by heading. Leave unset when the accordion is not part of the document outline.',
  },
  {
    name: 'openIds',
    type: 'ReadonlySet<string | number>',
    default: 'new Set()',
    description:
      'Two-way bindable set of open item ids — drive the accordion externally with [(openIds)].',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each item header. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogToggle',
    type: 'GogAccordionToggleEvent',
    description: 'Emitted with the item and its new open state whenever a header is toggled.',
  },
  {
    name: 'openIdsChange',
    type: 'ReadonlySet<string | number>',
    description: 'The open set after a toggle. Comes from the openIds model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogAccordionHeader',
    type: '$implicit (the item), open',
    description:
      'Replaces the header content (everything left of the chevron). Falls back to item.title. Rendered inside the header button, so it must not hold another control.',
  },
  {
    name: 'gogAccordionChevron',
    type: '$implicit (the item), open',
    description:
      'Replaces the trailing chevron icon. The library rotates only its own chevron; a template draws its own state. Ignored when showChevron is false.',
  },
  {
    name: 'gogAccordionContent',
    type: '$implicit (the item)',
    description: 'The panel body, rendered once per item.',
  },
];

@Component({
  selector: 'app-accordion-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './accordion-doc-page.html',
  styleUrl: './accordion-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'accordion')?.tokens ?? [];

  protected readonly sources = ACCORDION_EXAMPLES;
  protected readonly examples = {
    overview: AccordionOverviewExample,
    sizes: AccordionSizesExample,
    loading: AccordionLoadingExample,
    multi: AccordionMultiExample,
    controlled: AccordionControlledExample,
    templates: AccordionTemplatesExample,
    headingLevel: AccordionHeadingLevelExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { AccordionComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [AccordionComponent],\n})\n```";
}
