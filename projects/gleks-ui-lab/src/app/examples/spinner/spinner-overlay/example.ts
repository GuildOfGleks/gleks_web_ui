import { Component, signal } from '@angular/core';
import { ButtonComponent, SpinnerOverlayComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, SpinnerOverlayComponent],
})
export class SpinnerOverlayExample {
  protected readonly loading = signal(true);
}
