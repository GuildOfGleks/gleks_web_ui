import { Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ToggleComponent],
})
export class ToggleOverviewExample {
  protected readonly notifications = signal(true);
}
