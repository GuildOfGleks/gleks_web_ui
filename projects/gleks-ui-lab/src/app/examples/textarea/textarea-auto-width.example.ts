import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `<gog-textarea label="Short note" [fullWidth]="false" [rows]="2" />`,
})
export class TextareaAutoWidthExample {}
