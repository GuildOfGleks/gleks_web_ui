import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `<gog-chip iconName="info">Info</gog-chip>`,
})
export class ChipIconExample {}
