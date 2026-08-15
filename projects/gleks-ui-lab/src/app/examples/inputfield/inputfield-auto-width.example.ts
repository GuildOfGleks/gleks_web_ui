import { Component } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Zip code" [fullWidth]="false" placeholder="00000" />`,
})
export class InputfieldAutoWidthExample {}
