import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Name" placeholder="Ada Lovelace" [(value)]="name" />`,
})
export class InputfieldOverviewExample {
  protected readonly name = signal('');
}
