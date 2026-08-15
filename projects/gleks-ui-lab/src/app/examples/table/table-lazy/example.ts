import { Component, signal } from '@angular/core';
import { GogColumn, GogTableSortEvent, TableComponent } from '@guildofgleks/ui';

interface ServerRow {
  readonly id: number;
  readonly name: string;
  readonly team: string;
}

// Stands in for the backend so the example runs anywhere. In a real app this is an HTTP call.
const ALL_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  team: ['Platform', 'Design', 'Support'][index % 3],
}));

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableLazyExample {
  protected readonly serverRows = signal<ServerRow[]>([]);
  protected readonly serverTotal = signal(0);
  protected readonly serverPageSize = signal(10);
  protected readonly serverLoading = signal(false);

  private page = 1;
  private sort: GogTableSortEvent = { field: '', direction: null };

  constructor() {
    this.fetchPage();
  }

  protected onServerSort(sort: GogTableSortEvent): void {
    this.sort = sort;
    // The table has already reset itself to page 1 — that reset is part of the sort, which is
    // why gogPageChange stays quiet for it.
    this.page = 1;
    this.fetchPage();
  }

  protected onServerPage(page: number): void {
    this.page = page;
    this.fetchPage();
  }

  protected onServerPageSize(size: number): void {
    this.serverPageSize.set(size);
    this.page = 1;
    this.fetchPage();
  }

  private fetchPage(): void {
    this.serverLoading.set(true);

    setTimeout(() => {
      const sorted = this.sortRows(ALL_ROWS);
      const start = (this.page - 1) * this.serverPageSize();

      // Whatever arrives is rendered as-is: with `lazy`, the table neither sorts nor slices.
      this.serverRows.set(sorted.slice(start, start + this.serverPageSize()));
      this.serverTotal.set(ALL_ROWS.length);
      this.serverLoading.set(false);
    }, 300);
  }

  private sortRows(rows: readonly ServerRow[]): ServerRow[] {
    const { field, direction } = this.sort;
    if (!field || direction === null) return [...rows];

    const key = field as keyof ServerRow;
    return [...rows].sort(
      (a, b) => String(a[key]).localeCompare(String(b[key])) * (direction === 'asc' ? 1 : -1),
    );
  }
}
