import { Component } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `<gog-chip [fullWidth]="true">Full width</gog-chip>`,
})
export class ChipFullWidthExample {}
