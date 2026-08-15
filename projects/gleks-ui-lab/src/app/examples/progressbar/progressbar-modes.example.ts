import { Component } from '@angular/core';
import { ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  template: `
    <gog-progressbar [value]="42" ariaLabel="Upload" />
    <gog-progressbar mode="indeterminate" ariaLabel="Loading" />
    <gog-progressbar mode="buffer" [value]="42" [buffer]="70" ariaLabel="Playback" />
  `,
})
export class ProgressbarModesExample {}
