import { Component, signal } from '@angular/core';
import {
  ButtonToggleGroupComponent,
  GogButtonToggleOptionDirective,
  GogIconName,
  IconComponent,
} from '@guildofgleks/ui';

interface ViewOption {
  readonly id: string;
  readonly name: string;
  readonly icon: GogIconName;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonToggleGroupComponent, GogButtonToggleOptionDirective, IconComponent],
})
export class ButtonToggleSlotExample {
  protected readonly views: ViewOption[] = [
    { id: 'list', name: 'List', icon: 'sort' },
    { id: 'grid', name: 'Grid', icon: 'checkbox' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  ];
  protected readonly slotView = signal<unknown>('calendar');

  // The slot hands the option back as `unknown` — the directive cannot see the group's TOption —
  // so narrow it once here rather than sprinkling `$any(...)` through the template.
  protected asView(option: unknown): ViewOption {
    return option as ViewOption;
  }
}
