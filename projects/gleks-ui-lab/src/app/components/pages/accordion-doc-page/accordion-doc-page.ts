import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { ACCORDION_EXAMPLE_SOURCES } from '../../../examples/accordion/sources.generated';
import { AccordionControlledExample } from '../../../examples/accordion/accordion-controlled.example';
import { AccordionCustomHeaderExample } from '../../../examples/accordion/accordion-custom-header.example';
import { AccordionDisabledExample } from '../../../examples/accordion/accordion-disabled.example';
import { AccordionHeadingLevelExample } from '../../../examples/accordion/accordion-heading-level.example';
import { AccordionLoadingExample } from '../../../examples/accordion/accordion-loading.example';
import { AccordionMultiExample } from '../../../examples/accordion/accordion-multi.example';
import { AccordionOverviewExample } from '../../../examples/accordion/accordion-overview.example';
import { AccordionSizesExample } from '../../../examples/accordion/accordion-sizes.example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'items',
    type: 'GogAccordionItem[]',
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
];

interface SlotRow {
  readonly name: string;
  readonly context: string;
  readonly description: string;
}

const CONTENT_SLOTS: readonly SlotRow[] = [
  {
    name: 'gogAccordionHeader',
    context: 'let-item; let-open="open"',
    description:
      'Replaces the header content (everything left of the chevron). Falls back to item.title.',
  },
  {
    name: 'gogAccordionChevron',
    context: 'let-item; let-open="open"',
    description: 'Replaces the trailing chevron icon. Ignored when showChevron is false.',
  },
  {
    name: 'gogAccordionContent',
    context: 'let-item',
    description: 'The panel body, rendered only for the currently mounted items.',
  },
];

@Component({
  selector: 'app-accordion-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(ACCORDION_EXAMPLE_SOURCES)],
  templateUrl: './accordion-doc-page.html',
  styleUrl: './accordion-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly contentSlots = CONTENT_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'accordion')?.tokens ?? [];

  protected readonly multi = signal(false);
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());

  protected readonly importSnippet =
    "```typescript\nimport { AccordionComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [AccordionComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/accordion/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    controlled: AccordionControlledExample,
    customHeader: AccordionCustomHeaderExample,
    disabled: AccordionDisabledExample,
    headingLevel: AccordionHeadingLevelExample,
    loading: AccordionLoadingExample,
    multi: AccordionMultiExample,
    overview: AccordionOverviewExample,
    sizes: AccordionSizesExample,
  };
}
