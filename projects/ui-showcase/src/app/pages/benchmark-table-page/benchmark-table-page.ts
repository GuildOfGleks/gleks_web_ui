import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  CheckboxComponent,
  GogColumn,
  GogPanelHeaderDirective,
  PanelComponent,
  TableComponent,
} from '@guildofgleks/ui';

import { BenchmarkPanel } from '../../benchmark/benchmark-panel/benchmark-panel';
import { BenchmarkResult, BenchmarkRunner } from '../../benchmark/benchmark-runner';

interface BenchRow {
  id: number;
  name: string;
  status: string;
  value: string;
}

const STATUSES = ['Active', 'Pending', 'Archived'];

function buildRows(count: number): BenchRow[] {
  const rows: BenchRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i + 1,
      name: `Row ${i + 1}`,
      status: STATUSES[i % STATUSES.length],
      value: (i * 1.37).toFixed(2),
    };
  }
  return rows;
}

@Component({
  selector: 'app-benchmark-table-page',
  imports: [
    BenchmarkPanel,
    CheckboxComponent,
    DecimalPipe,
    GogColumn,
    GogPanelHeaderDirective,
    PanelComponent,
    TableComponent,
  ],
  templateUrl: './benchmark-table-page.html',
  styleUrl: './benchmark-table-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkTablePage {
  private readonly runner = inject(BenchmarkRunner);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  protected readonly rows = signal<BenchRow[]>([]);
  protected readonly results = signal<BenchmarkResult[]>([]);
  protected readonly running = signal(false);
  /** Off means every row in the run becomes a real `<tr>` — the literal "500,000 rows"
   *  question. On is how any real app would actually ship this. */
  protected readonly paginated = signal(true);

  protected async run(count: number): Promise<void> {
    this.running.set(true);
    try {
      const result = await this.runner.run(
        count,
        () => buildRows(count),
        (rows) => this.rows.set(rows),
        this.containerRef().nativeElement,
      );
      this.results.update((list) => [result, ...list]);
    } finally {
      this.running.set(false);
    }
  }

  protected reset(): void {
    this.rows.set([]);
  }
}
