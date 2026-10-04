import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogTagIconDirective, IconComponent, TagComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagShapesExample {
  protected readonly shapes = ['rounded', 'pill'] as const;
}
