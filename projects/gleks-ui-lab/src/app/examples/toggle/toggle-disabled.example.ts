import { Component } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  template: `
    <gog-toggle label="Disabled, off" [disabled]="true" />
    <gog-toggle label="Disabled, on" [disabled]="true" [checked]="true" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  `,
})
export class ToggleDisabledExample {}
