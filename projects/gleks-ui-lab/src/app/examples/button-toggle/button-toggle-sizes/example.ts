import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonToggleGroupComponent],
})
export class ButtonToggleSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly views = [
    { id: 'list', name: 'List' },
    { id: 'grid', name: 'Grid' },
    { id: 'calendar', name: 'Calendar' },
  ];
  protected readonly sizeView = signal<unknown>('list');
}
