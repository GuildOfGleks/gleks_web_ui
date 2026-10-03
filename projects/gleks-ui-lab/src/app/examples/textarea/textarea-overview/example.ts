import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaOverviewExample {
  protected readonly bio = signal('');
  protected readonly changes = signal(0);
}
