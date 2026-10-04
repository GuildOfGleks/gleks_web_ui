import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDurationExample {
  private readonly toasts = inject(ToastService);

  protected readonly durations = [1500, 4000, 10000];

  protected timed(duration: number): void {
    this.toasts.info(`duration: ${duration}`, { duration });
  }

  protected sticky(): void {
    this.toasts.warning('isSticky: true — stays until closed.', { isSticky: true });
  }

  protected dismissAll(): void {
    this.toasts.dismissAll();
  }
}
