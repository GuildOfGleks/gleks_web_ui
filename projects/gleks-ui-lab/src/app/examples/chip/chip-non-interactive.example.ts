import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `<gog-chip [clickable]="false">Read only</gog-chip>`,
})
export class ChipNonInteractiveExample {}
