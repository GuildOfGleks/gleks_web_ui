import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Toast } from '../../services/toast-service/toast-service';
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
  readonly dismissed = output<string>();

  readonly visible = signal(false);
  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly ariaRole = computed(() =>
    ['error', 'warning'].includes(this.toast().type) ? 'alert' : 'status',
  );

  protected readonly ariaLive = computed(() =>
    ['error', 'warning'].includes(this.toast().type) ? 'assertive' : 'polite',
  );

  constructor() {
    afterNextRender(() => this.visible.set(true));
    afterNextRender(() => {
      const toast = this.toast();
      if (!toast.isSticky) {
        this.autoDismissTimer = setTimeout(() => this.close(), toast.duration);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoDismissTimer !== null) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }

  close(): void {
    if (!this.visible()) return;
    if (this.autoDismissTimer !== null) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
    }
    this.visible.set(false);
    const id = this.toast().id;
    this.dismissTimer = setTimeout(() => {
      this.dismissTimer = null;
      this.dismissed.emit(id);
    }, 250);
  }
}
