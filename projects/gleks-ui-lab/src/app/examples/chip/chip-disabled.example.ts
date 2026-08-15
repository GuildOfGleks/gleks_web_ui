import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `<gog-chip [disabled]="true">Disabled</gog-chip>`,
})
export class ChipDisabledExample {}
