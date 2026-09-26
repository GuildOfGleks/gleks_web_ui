import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PaginatorComponent, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { PAGINATOR_SCOPE_CONFIG, PaginatorConfigScope } from './paginator-config-scope';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface PaginatorState {
  readonly page: number;
  readonly disabled: boolean;
}

interface A11yRow {
  readonly name: string;
  readonly target: string;
}

const PEOPLE = Array.from({ length: 47 }, (_, index) => `Person ${index + 1}`);

@Component({
  selector: 'app-paginator-page',
  imports: [
    JsonPipe,
    PaginatorComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    PaginatorConfigScope,
  ],
  templateUrl: './paginator-page.html',
  styleUrl: './paginator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly states: readonly Labelled<PaginatorState>[] = [
    { name: '[page]="1"', value: { page: 1, disabled: false } },
    { name: '[page]="3"', value: { page: 3, disabled: false } },
    { name: '[page]="5"', value: { page: 5, disabled: false } },
    { name: '[disabled]="true"', value: { page: 3, disabled: true } },
  ];

  protected readonly ranges: readonly Labelled<string>[] = [
    { name: 'window, visiblePages 5 (default)', value: 'window' },
    { name: 'window, showFirstPage + showLastPage', value: 'window-pinned' },
    { name: 'window, [visiblePages]="3"', value: 'window-3' },
    { name: 'rangeMode="ellipsis"', value: 'ellipsis' },
    { name: 'rangeMode="ellipsis", [siblingCount]="1"', value: 'ellipsis-1' },
  ];
  protected readonly rangePages = [1, 10, 20] as const;

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['paginator'] as const;

  protected readonly listPage = signal(1);
  protected readonly listSize = signal(10);
  protected readonly visiblePeople = computed(() => {
    const start = (this.listPage() - 1) * this.listSize();
    return PEOPLE.slice(start, start + this.listSize());
  });
  protected readonly total = PEOPLE.length;

  protected readonly shrinkPage = signal(8);
  protected readonly shrinkTotal = signal(8);

  protected readonly scopeConfig = PAGINATOR_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'the host', target: 'gog-paginator' },
    { name: 'the current page', target: 'gog-button:nth-of-type(4) button' },
    { name: 'another page', target: 'gog-button:nth-of-type(5) button' },
    { name: 'previous, on the first page', target: 'gog-button:first-of-type button' },
  ];
}
