import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: ` <gog-textarea label="Message" floatLabel="on" [rows]="2" /> `,
})
export class TextareaFloatLabelExample {}
