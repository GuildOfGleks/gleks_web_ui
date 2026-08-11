import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  GogColumn,
  InputfieldComponent,
  SpinnerComponent,
  TableComponent,
} from '@guildofgleks/ui';

import {
  BENCHMARK_DANGER_THRESHOLD,
  BENCHMARK_PRESETS,
  BenchmarkResult,
} from '../benchmark-runner';

/** `BenchmarkResult`, pre-formatted for the table — keeps the raw numbers in `results()` and
 *  every locale/unit decision confined to one place instead of scattered across `gogColumnBody`
 *  templates. */
interface DisplayRow {
  count: string;
  prepMs: string;
  renderMs: string;
  totalMs: string;
  domNodes: string;
  heapDeltaMb: string;
}

const numberFormat = new Intl.NumberFormat();

function formatRow(result: BenchmarkResult): DisplayRow {
  // A backgrounded tab inflates renderMs/totalMs into "how long until this tab got a frame
  // again", not a render duration — flagged inline rather than silently trusted next to
  // genuine readings.
  const warn = result.tabWasVisible ? '' : ' ⚠️ tab was backgrounded';
  return {
    count: numberFormat.format(result.count),
    prepMs: `${numberFormat.format(result.prepMs)} ms`,
    renderMs: `${numberFormat.format(result.renderMs)} ms${warn}`,
    totalMs: `${numberFormat.format(result.totalMs)} ms${warn}`,
    domNodes: numberFormat.format(result.domNodes),
    heapDeltaMb: result.heapDeltaMb === null ? '—' : `${result.heapDeltaMb.toFixed(1)} MB`,
  };
}

/**
 * The controls + results history every benchmark page shares: a preset/custom count picker, a
 * danger-threshold confirmation before a run that could freeze the tab, and a table of what
 * every run so far actually measured. What "run" means — build N of what, and how — is entirely
 * the page's own; this component only knows a count and a result shape.
 */
@Component({
  selector: 'app-benchmark-panel',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    GogColumn,
    InputfieldComponent,
    SpinnerComponent,
    TableComponent,
  ],
  templateUrl: './benchmark-panel.html',
  styleUrl: './benchmark-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkPanel {
  readonly presets = input<readonly number[]>(BENCHMARK_PRESETS);
  readonly dangerThreshold = input(BENCHMARK_DANGER_THRESHOLD);
  readonly running = input(false);
  readonly results = input<BenchmarkResult[]>([]);
  readonly hasMemoryColumn = input(true);
  /** What one unit of `count` is called in the confirmation copy and the run button —
   *  "rows", "items", "options", "instances". */
  readonly unitLabel = input('items');

  readonly runRequested = output<number>();
  readonly resetRequested = output<void>();

  protected readonly numberFormat = numberFormat;
  protected readonly displayRows = computed(() => this.results().map(formatRow));

  protected readonly selectedPreset = signal<number>(1_000);
  protected readonly customCount = signal<string>('');
  protected readonly confirmed = signal(false);

  protected readonly effectiveCount = computed(() => {
    const custom = Number(this.customCount());
    return this.customCount().trim() !== '' && Number.isFinite(custom) && custom > 0
      ? Math.floor(custom)
      : this.selectedPreset();
  });

  protected readonly needsConfirmation = computed(
    () => this.effectiveCount() >= this.dangerThreshold(),
  );

  protected selectPreset(count: number): void {
    this.selectedPreset.set(count);
    this.customCount.set('');
    this.confirmed.set(false);
  }

  protected onCustomCountChange(value: string): void {
    this.customCount.set(value);
    this.confirmed.set(false);
  }

  protected requestRun(): void {
    if (this.running() || (this.needsConfirmation() && !this.confirmed())) return;
    this.runRequested.emit(this.effectiveCount());
    this.confirmed.set(false);
  }

  protected requestReset(): void {
    this.resetRequested.emit();
  }
}
