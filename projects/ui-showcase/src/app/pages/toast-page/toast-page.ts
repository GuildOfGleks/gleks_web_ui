import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  GogSelectOption,
  InputfieldComponent,
  SelectComponent,
  ToastContainerComponent,
  ToastPosition,
  ToastService,
  ToastType,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-toast-page',
  imports: [ButtonComponent, InputfieldComponent, SelectComponent, ToastContainerComponent],
  templateUrl: './toast-page.html',
  styleUrl: './toast-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPage {
  private readonly toastService = inject(ToastService);

  protected readonly toastMessage = signal('Saved successfully');
  protected readonly toastType = signal<string | number | null>('success');
  protected readonly toastPosition = signal<string | number | null>('bottom-right');

  protected readonly toastTypes: GogSelectOption[] = [
    { id: 'success', name: 'Success' },
    { id: 'error', name: 'Error' },
    { id: 'warning', name: 'Warning' },
    { id: 'info', name: 'Info' },
  ];

  protected readonly positions: GogSelectOption[] = [
    { id: 'top-left', name: 'Top left' },
    { id: 'top-right', name: 'Top right' },
    { id: 'bottom-left', name: 'Bottom left' },
    { id: 'bottom-right', name: 'Bottom right' },
  ];

  protected showToast(): void {
    this.toastService.show({
      message: this.toastMessage(),
      type: this.toastType() as ToastType,
      position: this.toastPosition() as ToastPosition,
      actions: [
        {
          label: 'Undo',
          iconName: 'close',
          onClick: () => {
            this.toastService.info('Undo clicked');
          },
        },
      ],
    });
  }

  protected showToastBurst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });
    }
  }

  protected showTypeGallery(): void {
    this.toastService.success('Success — saved successfully.');
    this.toastService.error('Error — something went wrong.');
    this.toastService.warning('Warning — check this before continuing.');
    this.toastService.info('Info — just so you know.');
  }

  protected showSticky(): void {
    this.toastService.show({
      message: 'Sticky — stays until dismissed or "Dismiss all" is clicked.',
      type: 'warning',
      isSticky: true,
    });
  }

  protected showLongDuration(): void {
    this.toastService.show({
      message: 'Slow — auto-dismisses after 10s instead of the 4s default.',
      type: 'info',
      duration: 10000,
    });
  }

  protected dismissAll(): void {
    this.toastService.dismissAll();
  }
}
