import { Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ToggleComponent],
})
export class ToggleLayoutExample {
  protected readonly compactMode = signal(false);
  protected readonly labelStart = signal(true);
}
