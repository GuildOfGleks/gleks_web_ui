import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleAppearanceExample {
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
  protected readonly align = signal<string | null>('center');
}
