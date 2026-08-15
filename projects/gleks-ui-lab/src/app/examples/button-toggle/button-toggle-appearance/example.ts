import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogButtonToggleAppearance } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonToggleGroupComponent],
})
export class ButtonToggleAppearanceExample {
  protected readonly appearances: GogButtonToggleAppearance[] = ['joined', 'separated'];
  protected readonly views = [
    { id: 'list', name: 'List' },
    { id: 'grid', name: 'Grid' },
    { id: 'calendar', name: 'Calendar' },
  ];
  protected readonly view = signal<unknown>('grid');
}
