import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<gog-button (gogClick)="showOneOfEach()">Fire one of each type</gog-button>`,
})
export class ToastTypesExample {
  private readonly toastService = inject(ToastService);

  protected showOneOfEach(): void {
    this.toastService.success('Success — saved successfully.');
    this.toastService.error('Error — something went wrong.');
    this.toastService.warning('Warning — check this before continuing.');
    this.toastService.info('Info — just so you know.');
  }
}
