import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleFullWidthExample {
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
}
