import { Component } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 2.4s" ariaLabel="Loading, slow" />
    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 0.5s" ariaLabel="Loading, fast" />
  `,
})
export class SpinnerSpeedExample {}
