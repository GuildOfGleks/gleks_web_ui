import { Component } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Disabled" [disabled]="true" value="Read only" />`,
})
export class InputfieldDisabledExample {}
