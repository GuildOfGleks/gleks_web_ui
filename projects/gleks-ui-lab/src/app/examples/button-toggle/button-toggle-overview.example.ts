import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  template: ` <gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="view" /> `,
})
export class ButtonToggleOverviewExample {
  protected readonly views = [
    { id: 'list', name: 'List' },
    { id: 'grid', name: 'Grid' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'timeline', name: 'Timeline', disabled: true },
  ];
  protected readonly view = signal<unknown>('list');
}
