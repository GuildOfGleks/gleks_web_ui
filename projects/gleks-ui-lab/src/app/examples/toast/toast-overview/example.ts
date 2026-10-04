import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastOverviewExample {
  private readonly toasts = inject(ToastService);

  protected save(): void {
    this.toasts.success('Saved successfully');
  }
}
