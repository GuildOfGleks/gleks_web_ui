import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonToggleGroupComponent, GogButtonToggleAppearance, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly appearances: readonly GogButtonToggleAppearance[] = ['joined', 'separated'];
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
}
