import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Toast, ToastAction } from '../../services/toast-service/toast-service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'gog-toast',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'ariaRole()',
    '[attr.aria-live]': 'ariaLive()',
    '[attr.aria-atomic]': 'true',
  },
})
export class ToastComponent implements OnDestroy {
  readonly toast = input.required<Toast>();
  /** Whether this toast is the active, front-of-queue toast — only the front toast counts down. */
  readonly isFront = input<boolean>(true);
  readonly dismissed = output<string>();

  readonly visible = signal(false);
  readonly isPaused = signal(false);
  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private remainingMs = 0;
  private isClosing = signal(false);

  private readonly progressEl = viewChild<ElementRef<HTMLElement>>('progress');

  protected readonly hasActions = computed(() => this.toast().actions.length > 0);

  protected readonly ariaRole = computed(() =>
    ['error', 'warning'].includes(this.toast().type) ? 'alert' : 'status',
  );

  protected readonly ariaLive = computed(() =>
    ['error', 'warning'].includes(this.toast().type) ? 'assertive' : 'polite',
  );

  constructor() {
    afterNextRender(() => this.visible.set(true));
    effect((onCleanup) => {
      const toast = this.toast();
      const isFront = this.isFront();
      this.isPaused.set(false);
      this.isClosing.set(false);
      this.clearAutoDismissTimer();
      this.remainingMs = toast.duration;

      // Toasts queued behind the front one keep a full, frozen progress bar and don't count
      // down — they only start ticking once they become the front toast.
      if (!toast.isSticky && isFront) {
        this.restartProgressAnimation();
        this.startAutoDismiss(this.remainingMs);
      }

      onCleanup(() => this.clearAutoDismissTimer());
    });
  }

  ngOnDestroy(): void {
    this.clearAutoDismissTimer();
  }

  close(): void {
    if (!this.visible() || this.isClosing()) return;
    this.clearAutoDismissTimer();
    this.isPaused.set(false);
    this.isClosing.set(true);
    this.visible.set(false);
    const id = this.toast().id;

    if (this.prefersReducedMotion()) {
      this.isClosing.set(false);
      queueMicrotask(() => this.dismissed.emit(id));
    }
  }

  protected pauseAutoDismiss(): void {
    const toast = this.toast();
    if (toast.isSticky || !this.isFront() || this.isPaused() || this.isClosing()) return;
    if (this.autoDismissTimer === null) return;

    const elapsed = Date.now() - this.startedAt;
    this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    this.clearAutoDismissTimer();
    this.isPaused.set(true);
  }

  protected resumeAutoDismiss(): void {
    const toast = this.toast();
    if (toast.isSticky || !this.isFront() || !this.isPaused() || this.isClosing()) return;

    this.isPaused.set(false);
    if (this.remainingMs <= 0) {
      this.close();
      return;
    }

    this.startAutoDismiss(this.remainingMs);
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (!this.isClosing() || event.target !== event.currentTarget) return;
    if (event.propertyName !== 'opacity' && event.propertyName !== 'transform') return;

    this.isClosing.set(false);
    this.dismissed.emit(this.toast().id);
  }

  protected runAction(action: ToastAction): void {
    action.onClick(this.toast());
  }

  private startAutoDismiss(duration: number): void {
    this.clearAutoDismissTimer();
    this.remainingMs = duration;
    this.startedAt = Date.now();
    this.autoDismissTimer = setTimeout(() => {
      this.autoDismissTimer = null;
      this.remainingMs = 0;
      this.close();
    }, duration);
  }

  /**
   * Forces the CSS progress-bar animation to restart from full width. Simply updating the
   * `--toast-duration` custom property doesn't retrigger a running `animation`, so the element
   * is briefly detached from the animation and reflowed before being reattached.
   */
  private restartProgressAnimation(): void {
    const el = this.progressEl()?.nativeElement;
    if (!el) return;

    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  private clearAutoDismissTimer(): void {
    if (this.autoDismissTimer !== null) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
