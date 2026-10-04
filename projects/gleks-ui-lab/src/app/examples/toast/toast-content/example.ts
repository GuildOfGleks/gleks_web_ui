import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  ButtonComponent,
  IconComponent,
  Toast,
  ToastComponent,
  ToastService,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, IconComponent, ToastComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContentExample {
  private readonly toasts = inject(ToastService);
  protected readonly generation = signal(0);
  private readonly star = viewChild.required<TemplateRef<unknown>>('star');

  protected readonly long: Toast = {
    id: 'long',
    message:
      'The export finished, but 14 rows referenced a cost centre that no longer exists and were written with an empty value. Open the report to review them.',
    type: 'warning',
    iconName: 'warning',
    actions: [{ label: 'Open report', onClick: () => undefined }],
    isSticky: true,
    duration: 4000,
    position: 'bottom-right',
    dedupeKey: '',
    revision: 0,
  };

  protected withIconName(): void {
    // Any built-in, or a name the app registered with provideGogIcons. The colour stays the type's.
    this.toasts.info('Export ready', { iconName: 'download' });
  }

  protected withIconTemplate(): void {
    this.toasts.show({ message: 'Added to favourites', iconTemplate: this.star() });
  }
}
