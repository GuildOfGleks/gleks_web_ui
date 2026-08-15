import { Component, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `<gog-checkbox ariaLabel="Select row" [(checked)]="agreed" />`,
})
export class CheckboxNoLabelExample {
  protected readonly agreed = signal(false);
}
