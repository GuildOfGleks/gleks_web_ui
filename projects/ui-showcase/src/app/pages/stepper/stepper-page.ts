import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepperComponent, type GogSize, type GogStep } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-stepper-page',
  imports: [StepperComponent, DocAttrs, DocCell, DocMatrix, DocPage, DocSection],
  templateUrl: './stepper-page.html',
  styleUrl: './stepper-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly stepperColumn = ['stepper'] as const;

  /** Every state at once: done, an error, current, optional, disabled, not started. */
  protected readonly allStates: readonly GogStep[] = [
    { label: 'Account', description: 'Done', state: 'complete' },
    { label: 'Card', description: 'Declined', state: 'error' },
    { label: 'Address' },
    { label: 'Newsletter', optional: true },
    { label: 'Gift wrap', disabled: true },
    { label: 'Review' },
  ];

  protected readonly orientations: readonly Labelled<'horizontal' | 'vertical'>[] = [
    { name: 'horizontal', value: 'horizontal' },
    { name: 'vertical', value: 'vertical' },
  ];

  // A flow the reader can actually walk: "complete step" stands in for the app's own form.
  protected readonly flow = signal<GogStep[]>([
    { label: 'Account' },
    { label: 'Address' },
    { label: 'Payment' },
    { label: 'Review' },
  ]);
  protected readonly flowIndex = signal(0);
  protected readonly flowLinear = signal(true);
  protected readonly flowCurrent = computed(() => this.flow()[this.flowIndex()]);

  protected completeCurrent(): void {
    const index = this.flowIndex();
    this.flow.update((steps) =>
      steps.map((step, i) => (i === index ? { ...step, state: 'complete' as const } : step)),
    );
    if (index < this.flow().length - 1) this.flowIndex.set(index + 1);
  }

  protected failCurrent(): void {
    const index = this.flowIndex();
    this.flow.update((steps) =>
      steps.map((step, i) => (i === index ? { ...step, state: 'error' as const } : step)),
    );
  }

  protected resetFlow(): void {
    this.flow.set(this.flow().map(({ label }) => ({ label })));
    this.flowIndex.set(0);
  }
}
