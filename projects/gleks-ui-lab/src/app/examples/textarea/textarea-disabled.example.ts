import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `<gog-textarea label="Disabled" [disabled]="true" value="Read only" />`,
})
export class TextareaDisabledExample {}
