import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogPaginatorRangeMode,
  GogPanelHeaderDirective,
  GogSize,
  PaginatorComponent,
  PanelComponent,
} from '@guildofgleks/ui';

interface FaqItem extends GogAccordionItem {
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    title: 'What is Gleks UI?',
    answer: 'A themeable Angular component library built around signals.',
  },
  {
    id: 2,
    title: 'Does it support dark mode?',
    answer: 'Yes — every component reads its colors from theme tokens.',
  },
  {
    id: 3,
    title: 'Can I paginate any list?',
    answer: 'Yes — gog-paginator only needs a page count, not a data shape.',
  },
  {
    id: 4,
    title: 'Is it tree-shakeable?',
    answer: 'Each component is standalone, so unused ones are dropped at build time.',
  },
  {
    id: 5,
    title: 'What about accessibility?',
    answer: 'Roving focus, aria-sort, aria-current, and reduced-motion are handled for you.',
  },
  {
    id: 6,
    title: 'How do I report a bug?',
    answer: 'Open an issue on the component library repository.',
  },
  {
    id: 7,
    title: 'Can I override component styles?',
    answer: 'Yes — every component exposes CSS custom properties.',
  },
];

const FRUIT_ITEMS = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
  'Honeydew',
  'Kiwi',
  'Lemon',
  'Mango',
];

@Component({
  selector: 'app-paginator-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    GogAccordionContentDirective,
    GogPanelHeaderDirective,
    PaginatorComponent,
    PanelComponent,
  ],
  templateUrl: './paginator-page.html',
  styleUrl: './paginator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly basicPage = signal(1);
  protected readonly basicTotalPages = signal(20);

  protected readonly rangeModes: GogPaginatorRangeMode[] = ['window', 'ellipsis'];
  protected readonly visiblePagesOptions = [3, 5, 7];
  protected readonly demoRangeMode = signal<GogPaginatorRangeMode>('window');
  protected readonly demoVisiblePages = signal(5);
  protected readonly demoShowFirstPage = signal(false);
  protected readonly demoShowLastPage = signal(false);
  protected readonly siblingCountOptions = [1, 2, 3];
  protected readonly demoSiblingCount = signal(2);
  protected readonly demoPage = signal(10);
  protected readonly demoTotalPages = signal(20);

  protected readonly disabledPage = signal(3);

  private readonly listPageSize = 4;
  protected readonly listItems = FRUIT_ITEMS;
  protected readonly listPage = signal(1);
  protected readonly listTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.listItems.length / this.listPageSize)),
  );
  protected readonly visibleListItems = computed(() => {
    const start = (this.listPage() - 1) * this.listPageSize;
    return this.listItems.slice(start, start + this.listPageSize);
  });

  private readonly faqPageSize = 3;
  protected readonly faqItems = FAQ_ITEMS;
  protected readonly faqPage = signal(1);
  protected readonly faqTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.faqItems.length / this.faqPageSize)),
  );
  protected readonly visibleFaqItems = computed(() => {
    const start = (this.faqPage() - 1) * this.faqPageSize;
    return this.faqItems.slice(start, start + this.faqPageSize);
  });

  protected toggleShowFirstPage(): void {
    this.demoShowFirstPage.update((value) => !value);
  }

  protected toggleShowLastPage(): void {
    this.demoShowLastPage.update((value) => !value);
  }
}
