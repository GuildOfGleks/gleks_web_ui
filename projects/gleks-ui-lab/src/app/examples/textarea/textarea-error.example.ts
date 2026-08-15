import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `
    <gog-textarea
      label="Feedback"
      [(value)]="value"
      [errorMessage]="value().length > 0 && value().length < 10 ? 'At least 10 characters' : ''"
    />
  `,
})
export class TextareaErrorExample {
  protected readonly value = signal('');
}
