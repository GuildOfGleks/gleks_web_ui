import { Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  template: `
    <gog-toggle label="Analytics" onLabel="ON" offLabel="OFF" [(checked)]="analytics" />
  `,
})
export class ToggleTrackLabelsExample {
  protected readonly analytics = signal(false);
}
