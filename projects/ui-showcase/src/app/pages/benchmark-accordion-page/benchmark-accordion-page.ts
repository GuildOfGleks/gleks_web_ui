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
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@guildofgleks/ui';

import { BenchmarkPanel } from '../../benchmark/benchmark-panel/benchmark-panel';
import { BenchmarkResult, BenchmarkRunner } from '../../benchmark/benchmark-runner';

function buildItems(count: number): GogAccordionItem[] {
  const items: GogAccordionItem[] = new Array(count);
  for (let i = 0; i < count; i++) {
    items[i] = { id: i + 1, title: `Section ${i + 1}` };
  }
  return items;
}

@Component({
  selector: 'app-benchmark-accordion-page',
  imports: [AccordionComponent, BenchmarkPanel, DecimalPipe, GogAccordionContentDirective],
  templateUrl: './benchmark-accordion-page.html',
  styleUrl: './benchmark-accordion-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkAccordionPage {
  private readonly runner = inject(BenchmarkRunner);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  /** 899,999 is here on purpose. */
  protected readonly presets = [
    10, 100, 1_000, 10_000, 50_000, 100_000, 500_000, 899_999, 1_000_000,
  ];

  protected readonly items = signal<GogAccordionItem[]>([]);
  protected readonly results = signal<BenchmarkResult[]>([]);
  protected readonly running = signal(false);

  protected async run(count: number): Promise<void> {
    this.running.set(true);
    try {
      const result = await this.runner.run(
        count,
        () => buildItems(count),
        (items) => this.items.set(items),
        this.containerRef().nativeElement,
      );
      this.results.update((list) => [result, ...list]);
    } finally {
      this.running.set(false);
    }
  }

  protected reset(): void {
    this.items.set([]);
  }
}
