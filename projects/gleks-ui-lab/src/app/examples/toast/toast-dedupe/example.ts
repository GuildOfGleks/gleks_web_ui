import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDedupeExample {
  private readonly toasts = inject(ToastService);

  private count = 0;

  protected save(): void {
    this.count += 1;
    // The message changes every time, so the default key would differ: name one.
    this.toasts.info(`Saving draft… (${this.count})`, { dedupeKey: 'draft' });
  }
}
