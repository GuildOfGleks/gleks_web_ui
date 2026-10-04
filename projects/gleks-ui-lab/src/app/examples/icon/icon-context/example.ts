import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconContextExample {
  protected readonly fontSizes = ['12px', '16px', '24px'];
  protected readonly strokeWidths = ['1', '2', '3'];
}
