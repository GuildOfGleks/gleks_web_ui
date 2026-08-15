import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    <gog-chip shape="rounded">Rounded</gog-chip>
    <gog-chip shape="pill">Pill</gog-chip>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class ChipShapesExample {}
