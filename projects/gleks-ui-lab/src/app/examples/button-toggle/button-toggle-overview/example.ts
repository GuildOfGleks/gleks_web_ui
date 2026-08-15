import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonToggleGroupComponent],
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
