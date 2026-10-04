import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { GogColumn, GogTableSortEvent, TableComponent } from '@guildofgleks/ui/table';

interface ServerRow {
  id: number;
  name: string;
  team: string;
  score: number;
}

/** Stands in for a backend: 137 rows that only ever leave it one page at a time. */
const SERVER_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  name: `Record ${String(i + 1).padStart(3, '0')}`,
  team: ['Design', 'Forms', 'Data', 'Navigation'][i % 4],
  score: ((i * 37) % 100) + 1,
}));

@Component({
  selector: 'app-example',
  imports: [GogColumn, TableComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableLazyExample {
  protected readonly rows = signal<ServerRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(true);
  protected readonly lastRequest = signal('—');
  // The server orders by score until told otherwise; [sort] makes the header say so.
  protected readonly sort = signal<GogTableSortEvent>({ field: 'score', direction: 'desc' });
  private page = 1;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => this.fetch());
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onSort(sort: GogTableSortEvent): void {
    this.sort.set(sort);
    // The table has already gone back to page 1; gogPageChange stays quiet for that reset.
    this.page = 1;
    this.fetch();
  }

  protected onPage(page: number): void {
    this.page = page;
    this.fetch();
  }

  protected onPageSize(size: number): void {
    this.pageSize.set(size);
    this.page = 1;
    this.fetch();
  }

  /** The "request": the server sorts the whole set and cuts out the page, after 350 ms. */
  private fetch(): void {
    const { field, direction } = this.sort();
    this.loading.set(true);
    this.lastRequest.set(
      `page ${this.page}` + (direction ? `, sorted by ${field} ${direction}` : ', unsorted'),
    );
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const sorted = [...SERVER_ROWS];
      if (field && direction) {
        const key = field as keyof ServerRow;
        sorted.sort((a, b) => {
          const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
          return direction === 'asc' ? order : -order;
        });
      }
      const start = (this.page - 1) * this.pageSize();
      this.rows.set(sorted.slice(start, start + this.pageSize()));
      this.total.set(sorted.length);
      this.loading.set(false);
    }, 350);
  }
}
