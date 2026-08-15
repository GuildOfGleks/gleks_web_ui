import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `
    <gog-inputfield
      label="Username"
      [(value)]="value"
      [errorMessage]="value().length > 0 && value().length < 3 ? 'At least 3 characters' : ''"
    />
  `,
})
export class InputfieldErrorExample {
  protected readonly value = signal('');
}
