import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, ToastPosition, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastTypesExample {
  private readonly toasts = inject(ToastService);

  protected readonly positions: ToastPosition[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  protected oneOfEach(): void {
    this.toasts.success('Saved.');
    this.toasts.info('Sync starts in a minute.');
    this.toasts.warning('Storage is 90% full.');
    this.toasts.error('Upload failed.');
  }

  protected at(position: ToastPosition): void {
    this.toasts.info(`position: '${position}'`, { position });
  }

  protected burst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toasts.info(`Queued ${index} of 7`, { position: 'top-right' });
    }
  }
}
