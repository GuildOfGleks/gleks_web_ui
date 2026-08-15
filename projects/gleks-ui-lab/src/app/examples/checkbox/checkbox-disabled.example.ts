import { Component } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `
    <gog-checkbox label="Disabled, unchecked" [disabled]="true" />
    <gog-checkbox label="Disabled, checked" [checked]="true" [disabled]="true" />
    <gog-checkbox label="Disabled, indeterminate" [indeterminate]="true" [disabled]="true" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class CheckboxDisabledExample {}
