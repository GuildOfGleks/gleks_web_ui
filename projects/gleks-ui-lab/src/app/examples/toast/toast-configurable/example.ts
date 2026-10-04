import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  GogDropdownOption,
  InputfieldComponent,
  SelectComponent,
  ToastPosition,
  ToastService,
  ToastType,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, InputfieldComponent, SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastConfigurableExample {
  private readonly toasts = inject(ToastService);

  protected readonly message = signal('Saved successfully');
  protected readonly type = signal<string | number | null>('success');
  protected readonly position = signal<string | number | null>('bottom-right');

  protected readonly types: GogDropdownOption[] = [
    { id: 'success', name: 'Success' },
    { id: 'error', name: 'Error' },
    { id: 'warning', name: 'Warning' },
    { id: 'info', name: 'Info' },
  ];
  protected readonly positions: GogDropdownOption[] = [
    { id: 'top-left', name: 'Top left' },
    { id: 'top-right', name: 'Top right' },
    { id: 'bottom-left', name: 'Bottom left' },
    { id: 'bottom-right', name: 'Bottom right' },
  ];

  protected preview(): void {
    this.toasts.show({
      message: this.message(),
      type: this.type() as ToastType,
      position: this.position() as ToastPosition,
    });
  }
}
