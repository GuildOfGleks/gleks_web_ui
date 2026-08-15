import { Component } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `<gog-spinner ariaLabel="Loading" />`,
})
export class SpinnerOverviewExample {}
