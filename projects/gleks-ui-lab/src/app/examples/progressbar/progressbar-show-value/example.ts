import { Component, signal } from '@angular/core';
import { ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ProgressbarComponent],
})
export class ProgressbarShowValueExample {
  protected readonly uploaded = signal(42);
}
