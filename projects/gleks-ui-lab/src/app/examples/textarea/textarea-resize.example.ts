import { Component } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `
    <gog-textarea label="Both axes" resize="both" [rows]="3" />
    <gog-textarea label="Fixed size" resize="none" [rows]="3" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class TextareaResizeExample {}
