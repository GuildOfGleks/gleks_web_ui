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
})
export class CheckboxDisabledExample {}
