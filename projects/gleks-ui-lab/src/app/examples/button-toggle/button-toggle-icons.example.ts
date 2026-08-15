import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogIconName } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  template: `
    <gog-button-toggle-group optionIcon="icon" [options]="views" [(value)]="iconView" />
  `,
})
export class ButtonToggleIconsExample {
  protected readonly views: { id: string; name: string; icon: GogIconName }[] = [
    { id: 'list', name: 'List', icon: 'sort' },
    { id: 'grid', name: 'Grid', icon: 'checkbox' },
  ];
  protected readonly iconView = signal<unknown>('grid');
}
