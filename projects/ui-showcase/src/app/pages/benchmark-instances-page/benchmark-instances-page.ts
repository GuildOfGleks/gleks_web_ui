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
  ButtonComponent,
  CheckboxComponent,
  DividerComponent,
  GogBadgeDirective,
  GogRadioOption,
  InputfieldComponent,
  RadioGroupComponent,
  SkeletonComponent,
  SpinnerComponent,
  TagComponent,
  ToggleComponent,
} from '@guildofgleks/ui';

import { BenchmarkPanel } from '../../benchmark/benchmark-panel/benchmark-panel';
import { BenchmarkResult, BenchmarkRunner } from '../../benchmark/benchmark-runner';

type InstanceKind =
  | 'button'
  | 'checkbox'
  | 'tag'
  | 'toggle'
  | 'inputfield'
  | 'divider'
  | 'skeleton'
  | 'spinner'
  | 'badge';

const KIND_OPTIONS: GogRadioOption[] = [
  { id: 'button', label: 'gog-button' },
  { id: 'checkbox', label: 'gog-checkbox' },
  { id: 'tag', label: 'gog-tag' },
  { id: 'toggle', label: 'gog-toggle' },
  { id: 'inputfield', label: 'gog-inputfield' },
  { id: 'divider', label: 'gog-divider' },
  { id: 'skeleton', label: 'gog-skeleton' },
  { id: 'spinner', label: 'gog-spinner' },
  { id: 'badge', label: 'gogBadge' },
];

@Component({
  selector: 'app-benchmark-instances-page',
  imports: [
    BenchmarkPanel,
    ButtonComponent,
    CheckboxComponent,
    DecimalPipe,
    DividerComponent,
    GogBadgeDirective,
    InputfieldComponent,
    RadioGroupComponent,
    SkeletonComponent,
    SpinnerComponent,
    TagComponent,
    ToggleComponent,
  ],
  templateUrl: './benchmark-instances-page.html',
  styleUrl: './benchmark-instances-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchmarkInstancesPage {
  private readonly runner = inject(BenchmarkRunner);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('container');

  protected readonly kindOptions = KIND_OPTIONS;
  protected readonly kind = signal<InstanceKind>('button');
  protected readonly indices = signal<number[]>([]);
  protected readonly results = signal<BenchmarkResult[]>([]);
  protected readonly running = signal(false);

  protected setKind(value: string | number | null): void {
    if (value === null) return;
    this.kind.set(value as InstanceKind);
    this.indices.set([]);
    this.results.set([]);
  }

  protected async run(count: number): Promise<void> {
    this.running.set(true);
    try {
      const result = await this.runner.run(
        count,
        () => Array.from({ length: count }, (_, i) => i + 1),
        (indices) => this.indices.set(indices),
        this.containerRef().nativeElement,
      );
      this.results.update((list) => [result, ...list]);
    } finally {
      this.running.set(false);
    }
  }

  protected reset(): void {
    this.indices.set([]);
  }
}
