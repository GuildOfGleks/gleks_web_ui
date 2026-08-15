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
  imports: [ButtonToggleGroupComponent, GogButtonToggleOptionDirective, IconComponent],
  template: `
    <gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="slotView">
      <ng-template gogButtonToggleOption let-option let-selected="selected">
        <gog-icon [name]="asView(option).icon" />
        <span>{{ asView(option).name }}</span>
        @if (selected) {
          <gog-icon name="check" />
        }
      </ng-template>
    </gog-button-toggle-group>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
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
