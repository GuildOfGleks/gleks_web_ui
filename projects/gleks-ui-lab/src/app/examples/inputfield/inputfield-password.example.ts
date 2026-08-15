import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Password" type="password" [(value)]="password" />`,
})
export class InputfieldPasswordExample {
  protected readonly password = signal('');
}
