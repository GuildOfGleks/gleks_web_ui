import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    <gog-chip shape="rounded">Rounded</gog-chip>
    <gog-chip shape="pill">Pill</gog-chip>
  `,
})
export class ChipShapesExample {}
