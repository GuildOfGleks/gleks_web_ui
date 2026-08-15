import { Component } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Email" floatLabel="on" />`,
})
export class InputfieldFloatLabelExample {}
