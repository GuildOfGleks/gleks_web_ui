import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToggleComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleStatesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
