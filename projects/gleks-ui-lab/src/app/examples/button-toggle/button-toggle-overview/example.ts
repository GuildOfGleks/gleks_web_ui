import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleOverviewExample {
  protected readonly views = [
    { id: 'list', name: 'List' },
    { id: 'grid', name: 'Grid' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'timeline', name: 'Timeline', disabled: true },
  ];
  protected readonly view = signal<string | null>('list');
}
