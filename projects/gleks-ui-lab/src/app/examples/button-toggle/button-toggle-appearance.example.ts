import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogButtonToggleAppearance } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  template: `
    @for (option of appearances; track option) {
      <gog-button-toggle-group [appearance]="option" [options]="views" [(value)]="view" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  `,
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
