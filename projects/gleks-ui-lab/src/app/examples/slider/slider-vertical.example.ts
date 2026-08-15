import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider label="Bass" orientation="vertical" [(value)]="bass" />
    <gog-slider label="Mid" orientation="vertical" [(value)]="mid" />
  `,
  styles: `
    :host {
      display: flex;
      gap: 24px;
    }
  `,
})
export class SliderVerticalExample {
  protected readonly bass = signal(60);
  protected readonly mid = signal(45);
}
