import { Component } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `<gog-checkbox label="Full width row" [fullWidth]="true" />`,
})
export class CheckboxFullWidthExample {}
