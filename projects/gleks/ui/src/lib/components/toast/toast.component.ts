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

@Component({
  selector: 'gog-toast',
  imports: [ButtonComponent],
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

  protected readonly icon = computed(() => {
    const icons: Record<string, string> = {
      success: 'fa-solid fa-check',
      error: 'fa-solid fa-xmark',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info',
    };
    return icons[this.toast().type] ?? 'fa-solid fa-circle-info';
  });

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
  }

  close(): void {
    if (!this.visible()) return;
    if (this.autoDismissTimer !== null) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
    this.visible.set(false);
    const id = this.toast().id;
    setTimeout(() => this.dismissed.emit(id), 250);
  }
}
