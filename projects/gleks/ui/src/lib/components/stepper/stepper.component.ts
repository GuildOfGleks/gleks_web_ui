import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  booleanAttribute,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { GOG_CONFIG, GogOrientation, GogSize, resolveConfigured } from '@guildofgleks/ui/shared';

/** One step of a `gog-stepper`. */
export interface GogStep {
  label: string;
  description?: string;
  /** Unset: not started. The app sets it — the stepper never decides a step is done. */
  state?: 'complete' | 'error';
  /** Never reachable from the stepper, whatever `linear` says. */
  disabled?: boolean;
  /** Shows "Optional" under the label; a linear stepper does not wait for it. */
  optional?: boolean;
}

/** Built-in defaults, used when `GOG_CONFIG.labels` leaves them unset. */
const DEFAULT_LABELS = {
  stepper: 'Progress',
  stepCompleted: 'completed',
  stepError: 'has an error',
  stepOptional: 'Optional',
};

/**
 * Where a reader is in a multi-step task: an indicator that shows the steps and moves between them.
 * The app renders each step's content from `activeIndex`, and marks a step complete in its own data
 * — whether a step may be left is the app's knowledge, not the stepper's. `docs/stepper.md` has the
 * argument.
 *
 * **What it says.** The current step carries `aria-current="step"`, and every other step's state
 * follows its label as visually hidden text ("Account, completed"), so a screen reader hears what
 * the indicator shows.
 *
 * **What can be reached.** A step is a button only when a press may move there: always backwards,
 * and forwards — when `linear` — only as far as every step before it is complete or optional. The
 * rest are plain text rather than disabled buttons, which would still be tab stops to walk past.
 */
@Component({
  selector: 'gog-stepper',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class StepperComponent {
  readonly steps = input<readonly GogStep[]>([]);
  /** The current step, two-way. A press on a reachable step sets it. */
  readonly activeIndex = model(0);
  /** Forward only as far as every step before is complete or optional. Backwards is always open. */
  readonly linear = input(true, { transform: booleanAttribute });
  readonly orientation = input<GogOrientation>('horizontal');
  readonly size = input<GogSize>('md');
  /** Names the list. Unset, `GOG_CONFIG.labels.stepper`, then `'Progress'`. */
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly globalConfig = inject(GOG_CONFIG);

  protected readonly resolvedLabels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      list: resolveConfigured(this.ariaLabel(), configured.stepper, DEFAULT_LABELS.stepper),
      completed: resolveConfigured(
        undefined,
        configured.stepCompleted,
        DEFAULT_LABELS.stepCompleted,
      ),
      error: resolveConfigured(undefined, configured.stepError, DEFAULT_LABELS.stepError),
      optional: resolveConfigured(undefined, configured.stepOptional, DEFAULT_LABELS.stepOptional),
    };
  });

  /** Per step: whether a press may move there. */
  protected readonly reachable = computed(() => {
    const steps = this.steps();
    const active = this.activeIndex();
    let openAhead = true;
    return steps.map((step, index) => {
      const ok = !step.disabled && (!this.linear() || index <= active || openAhead);
      // Every later step waits on this one unless it is done or may be skipped.
      if (step.state !== 'complete' && !step.optional) openAhead = false;
      return ok;
    });
  });

  protected readonly hostClasses = computed(() =>
    ['gog-stepper', `gog-stepper--${this.size()}`, `gog-stepper--${this.orientation()}`].join(' '),
  );

  protected stateText(step: GogStep): string | null {
    if (step.state === 'complete') return this.resolvedLabels().completed;
    if (step.state === 'error') return this.resolvedLabels().error;
    return null;
  }

  protected select(index: number): void {
    if (this.reachable()[index]) this.activeIndex.set(index);
  }
}
