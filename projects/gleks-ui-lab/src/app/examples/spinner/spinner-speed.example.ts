import { Component } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 2.4s" ariaLabel="Loading, slow" />
    <gog-spinner size="lg" style="--gog-spinner-spin-duration: 0.5s" ariaLabel="Loading, fast" />
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
export class SpinnerSpeedExample {}
