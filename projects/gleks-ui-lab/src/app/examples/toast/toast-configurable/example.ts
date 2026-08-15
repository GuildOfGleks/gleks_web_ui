import { Component, inject, signal } from '@angular/core';
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
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, InputfieldComponent, SelectComponent],
})
export class ToastConfigurableExample {
  private readonly toastService = inject(ToastService);
  protected readonly toastMessage = signal('Saved successfully');
  protected readonly toastType = signal<string | number | null>('success');
  protected readonly toastPosition = signal<string | number | null>('bottom-right');
  protected readonly toastTypes: GogDropdownOption[] = [
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

  protected showConfigured(): void {
    this.toastService.show({
      message: this.toastMessage(),
      type: this.toastType() as ToastType,
      position: this.toastPosition() as ToastPosition,
    });
  }
}
