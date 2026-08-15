import { Component, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ChipComponent],
})
export class ChipOverviewExample {
  protected readonly lastClicked = signal('No chip clicked yet.');

  protected onClick(label: string): void {
    this.lastClicked.set(`Clicked "${label}"`);
  }
}
