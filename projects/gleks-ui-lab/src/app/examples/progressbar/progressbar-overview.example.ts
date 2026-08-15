import { Component } from '@angular/core';
import { ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  template: `<gog-progressbar [value]="42" ariaLabel="Upload progress" />`,
})
export class ProgressbarOverviewExample {}
