// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { PaginatorDisabledExample } from './paginator-disabled.example';
import { PaginatorEllipsisModeExample } from './paginator-ellipsis-mode.example';
import { PaginatorFullWidthExample } from './paginator-full-width.example';
import { PaginatorListExample } from './paginator-list.example';
import { PaginatorOverviewExample } from './paginator-overview.example';
import { PaginatorRecordsExample } from './paginator-records.example';
import { PaginatorSizesExample } from './paginator-sizes.example';
import { PaginatorWindowModeExample } from './paginator-window-mode.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const PAGINATOR_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    PaginatorDisabledExample,
    'import { Component, signal } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `<gog-paginator [(page)]="page" [totalPages]="8" [disabled]="true" />`,\n})\nexport class PaginatorDisabledExample {\n  protected readonly page = signal(3);\n}',
  ],
  [
    PaginatorEllipsisModeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `\n    <gog-paginator\n      [(page)]="page"\n      [totalPages]="totalPages()"\n      rangeMode="ellipsis"\n      [siblingCount]="1"\n    />\n  `,\n})\nexport class PaginatorEllipsisModeExample {\n  protected readonly page = signal(10);\n  protected readonly totalPages = signal(20);\n}',
  ],
  [
    PaginatorFullWidthExample,
    'import { Component } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `\n    <gog-paginator [totalPages]="5" [page]="2" />\n    <gog-paginator [totalPages]="5" [page]="2" [fullWidth]="false" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 16px;\n    }\n  `,\n})\nexport class PaginatorFullWidthExample {}',
  ],
  [
    PaginatorListExample,
    "import { Component, computed, signal } from '@angular/core';\nimport { PaginatorComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [PaginatorComponent],\n  template: `\n    <ul>\n      @for (item of visibleItems(); track item) {\n        <li>{{ item }}</li>\n      }\n    </ul>\n    <gog-paginator [(page)]=\"page\" [totalPages]=\"totalPages()\" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 16px;\n    }\n  `,\n})\nexport class PaginatorListExample {\n  private readonly pageSize = 4;\n  private readonly items = [\n    'Apple',\n    'Banana',\n    'Cherry',\n    'Date',\n    'Elderberry',\n    'Fig',\n    'Grape',\n    'Honeydew',\n    'Kiwi',\n    'Lemon',\n  ];\n  protected readonly page = signal(1);\n  protected readonly totalPages = computed(() =>\n    Math.max(1, Math.ceil(this.items.length / this.pageSize)),\n  );\n  protected readonly visibleItems = computed(() => {\n    const start = (this.page() - 1) * this.pageSize;\n    return this.items.slice(start, start + this.pageSize);\n  });\n}",
  ],
  [
    PaginatorOverviewExample,
    'import { Component, signal } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `\n    <gog-paginator [(page)]="page" [totalPages]="totalPages()" />\n    <p class="readout">Page {{ page() }} of {{ totalPages() }}</p>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      gap: 12px;\n    }\n    .readout {\n      margin: 0;\n      color: var(--gog-muted-text-color);\n      font-size: 0.9em;\n    }\n  `,\n})\nexport class PaginatorOverviewExample {\n  protected readonly page = signal(1);\n  protected readonly totalPages = signal(20);\n}',
  ],
  [
    PaginatorRecordsExample,
    'import { Component, signal } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\ninterface Item {\n  readonly id: number;\n}\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `\n    <gog-paginator\n      [(page)]="page"\n      [(pageSize)]="pageSize"\n      [totalRecords]="items().length"\n      [showPageSizeSelect]="true"\n      [pageSizeOptions]="[10, 20, 50]"\n    />\n    <p>Page {{ page() }}, {{ pageSize() }} per page, {{ items().length }} records.</p>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 16px;\n    }\n  `,\n})\nexport class PaginatorRecordsExample {\n  protected readonly page = signal(1);\n  protected readonly pageSize = signal(10);\n  protected readonly items = signal<Item[]>(\n    Array.from({ length: 137 }, (_, index) => ({ id: index + 1 })),\n  );\n\n  // No `totalPages` computed to write, and none to keep in sync with the size select: the\n  // paginator derives the page count from totalRecords and pageSize itself.\n}',
  ],
  [
    PaginatorSizesExample,
    "import { Component, signal } from '@angular/core';\nimport { GogSize, PaginatorComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [PaginatorComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-paginator [totalPages]=\"5\" [page]=\"page()\" [size]=\"sizeOption\" />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 16px;\n    }\n  `,\n})\nexport class PaginatorSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n  protected readonly page = signal(2);\n}",
  ],
  [
    PaginatorWindowModeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { PaginatorComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [PaginatorComponent],\n  template: `\n    <gog-paginator\n      [(page)]="page"\n      [totalPages]="totalPages()"\n      [visiblePages]="5"\n      [showFirstPage]="true"\n      [showLastPage]="true"\n    />\n  `,\n})\nexport class PaginatorWindowModeExample {\n  protected readonly page = signal(10);\n  protected readonly totalPages = signal(20);\n}',
  ],
]);
