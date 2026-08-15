import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class ToastOverviewExample {
  private readonly toastService = inject(ToastService);

  protected showToast(): void {
    this.toastService.success('Saved successfully');
  }
}
