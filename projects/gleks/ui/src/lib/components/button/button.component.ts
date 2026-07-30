import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';

import { Subject, timer } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GogSize, GogVariant } from '../../shared/types';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'gog-button',
  imports: [SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Drives the :host(.gog-host--full-width) rules in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect.
    '[class.gog-host--full-width]': 'fullWidth()',
  },
})
export class ButtonComponent {
  variant = input<GogVariant>('primary');
  size = input<GogSize>('md');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  loading = input<boolean>(false);

  /**
   * Minimum time, in ms, between accepted clicks. This is a spam/double-click
   * guard, not a delay before the first click fires: the first click in a
   * window is emitted immediately (leading edge), and any further clicks
   * within `debounce` ms are silently dropped until the window elapses.
   */
  debounce = input<number>(300);

  /**
   * Accessible name for the button, forwarded to the native <button>.
   * Setting `aria-label` directly on <gog-button> in a template does NOT
   * work — that attribute lands on the custom element host, not on the
   * actual interactive <button> inside it, so assistive tech never sees it.
   * Use this input instead, especially for icon-only buttons.
   */
  ariaLabel = input<string | null>(null);

  gogClick = output<MouseEvent>();

  /** Fully non-interactive: excluded from tab order via the native `disabled` attribute. */
  protected isNativeDisabled = computed(() => this.disabled());
  /** Logically blocked from activating (disabled OR loading), used to guard click handling. */
  protected isDisabled = computed(() => this.disabled() || this.loading());
  private static readonly SPINNER_SIZE_BY_BUTTON_SIZE: Record<GogSize, GogSize> = {
    xsm: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    slg: 'lg',
  };
  protected spinnerSize = computed<GogSize>(
    () => ButtonComponent.SPINNER_SIZE_BY_BUTTON_SIZE[this.size()],
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly click$ = new Subject<MouseEvent>();

  constructor() {
    this.click$
      .pipe(
        throttle(() => timer(this.debounce()), { leading: true, trailing: false }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.gogClick.emit(event));
  }

  protected onClick(event: MouseEvent): void {
    if (this.isDisabled()) return;
    this.click$.next(event);
  }
}
