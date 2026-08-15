import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
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
