import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `<gog-textarea label="Notes" [rows]="8" />`,
})
export class TextareaRowsExample {}
