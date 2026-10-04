import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogPanelHeaderDirective, GogSize, PanelComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogPanelHeaderDirective, PanelComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
