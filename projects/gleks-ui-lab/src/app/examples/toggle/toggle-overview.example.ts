import { Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  template: `<gog-toggle label="Notifications" [(checked)]="notifications" />`,
})
export class ToggleOverviewExample {
  protected readonly notifications = signal(true);
}
