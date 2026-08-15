import { Component, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    <gog-chip (gogClick)="onClick('Design')">Design</gog-chip>
    <p class="readout">{{ lastClicked() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class ChipOverviewExample {
  protected readonly lastClicked = signal('No chip clicked yet.');

  protected onClick(label: string): void {
    this.lastClicked.set(`Clicked "${label}"`);
  }
}
