import { Component, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `<gog-checkbox label="I agree" [(checked)]="agreed" />`,
})
export class CheckboxOverviewExample {
  protected readonly agreed = signal(false);
}
