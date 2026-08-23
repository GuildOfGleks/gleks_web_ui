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
  AutocompleteComponent,
  GogDropdownOption,
  GogPanelHeaderDirective,
  GogRadioOption,
  MultiselectComponent,
  PanelComponent,
  RadioGroupComponent,
  SelectComponent,
} from '@guildofgleks/ui';

import { BenchmarkPanel } from '../../benchmark/benchmark-panel/benchmark-panel';
import { BenchmarkResult, BenchmarkRunner } from '../../benchmark/benchmark-runner';

type DropdownKind = 'select' | 'multiselect' | 'autocomplete';

const KIND_OPTIONS: GogRadioOption[] = [
  { id: 'select', label: 'gog-select' },
  { id: 'multiselect', label: 'gog-multiselect' },
  { id: 'autocomplete', label: 'gog-autocomplete' },
];

function buildOptions(count: number): GogDropdownOption[] {
  const options: GogDropdownOption[] = new Array(count);
  for (let i = 0; i < count; i++) {
    options[i] = { id: i + 1, name: `Option ${i + 1}` };
  }
  return options;
}

@Component({
  selector: 'app-benchmark-dropdown-page',
  imports: [
    AutocompleteComponent,
    BenchmarkPanel,
    DecimalPipe,
    GogPanelHeaderDirective,
    MultiselectComponent,
    PanelComponent,
    RadioGroupComponent,
    SelectComponent,
  ],
  templateUrl: './benchmark-dropdown-page.html',
  styleUrl: './benchmark-dropdown-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkDropdownPage {
  private readonly runner = inject(BenchmarkRunner);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  protected readonly kindOptions = KIND_OPTIONS;
  protected readonly kind = signal<DropdownKind>('select');
  protected readonly options = signal<GogDropdownOption[]>([]);
  protected readonly results = signal<BenchmarkResult[]>([]);
  protected readonly running = signal(false);

  protected setKind(value: string | number | null): void {
    if (value === null) return;
    this.kind.set(value as DropdownKind);
    this.options.set([]);
    this.results.set([]);
  }

  /**
   * Setting `[options]` alone is cheap regardless of N — it's just an array reference. The
   * real cost only shows up once the panel actually opens and stamps all N rows, so the run
   * also opens it (simulating the trigger a user would click) rather than just measuring the
   * assignment.
   */
  protected async run(count: number): Promise<void> {
    this.running.set(true);
    try {
      const result = await this.runner.run(
        count,
        () => buildOptions(count),
        (options) => {
          this.options.set(options);
          this.openTrigger();
        },
        this.containerRef().nativeElement,
      );
      this.results.update((list) => [result, ...list]);
    } finally {
      this.running.set(false);
    }
  }

  private openTrigger(): void {
    const root = this.containerRef().nativeElement;
    switch (this.kind()) {
      case 'select':
        root.querySelector<HTMLElement>('.gog-select__control')?.click();
        return;
      case 'multiselect':
        root.querySelector<HTMLElement>('.gog-ms')?.click();
        return;
      case 'autocomplete':
        root.querySelector<HTMLElement>('.gog-autocomplete__control')?.focus();
        return;
    }
  }

  protected reset(): void {
    this.options.set([]);
  }
}
