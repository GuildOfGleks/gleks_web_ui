import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonToggleGroupComponent,
  GogButtonToggleOptionDirective,
  GogIconName,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent, GogButtonToggleOptionDirective, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleSlotExample {
  protected readonly tools: readonly { id: string; name: string; icon: GogIconName }[] = [
    { id: 'search', name: 'Search', icon: 'search' },
    { id: 'filter', name: 'Filter', icon: 'filter' },
    { id: 'star', name: 'Star', icon: 'star' },
  ];
  protected readonly view = signal<string | null>('filter');
  protected readonly active = signal<string[]>([]);
}
