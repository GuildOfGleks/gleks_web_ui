import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogIconName } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleIconsExample {
  protected readonly tools: readonly { id: string; name: string; icon: GogIconName }[] = [
    { id: 'search', name: 'Search', icon: 'search' },
    { id: 'filter', name: 'Filter', icon: 'filter' },
    { id: 'star', name: 'Star', icon: 'star' },
  ];
  protected readonly active = signal<string[]>(['search']);
}
