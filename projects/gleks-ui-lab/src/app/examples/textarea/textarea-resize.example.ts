import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `
    <gog-textarea label="Both axes" resize="both" [rows]="3" />
    <gog-textarea label="Fixed size" resize="none" [rows]="3" />
  `,
})
export class TextareaResizeExample {}
