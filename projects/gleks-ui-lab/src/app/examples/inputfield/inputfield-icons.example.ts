import { Component } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `
    <gog-inputfield label="Search" iconStart="info" placeholder="Decorative start icon" />
  `,
})
export class InputfieldIconsExample {}
