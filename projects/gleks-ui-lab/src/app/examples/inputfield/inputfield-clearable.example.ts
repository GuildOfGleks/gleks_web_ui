import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `<gog-inputfield label="Search" [clearable]="true" [(value)]="search" />`,
})
export class InputfieldClearableExample {
  protected readonly search = signal('');
}
