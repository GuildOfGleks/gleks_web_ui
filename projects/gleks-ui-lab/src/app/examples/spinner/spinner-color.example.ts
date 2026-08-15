import { Component } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    <gog-spinner
      ariaLabel="Loading, danger color"
      style="--gog-spinner-color: var(--gog-danger-color)"
    />
    <gog-spinner
      ariaLabel="Loading, success color"
      style="--gog-spinner-color: var(--gog-success-color)"
    />
  `,
})
export class SpinnerColorExample {}
