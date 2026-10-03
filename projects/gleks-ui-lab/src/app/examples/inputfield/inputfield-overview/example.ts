import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldOverviewExample {
  protected readonly name = signal('');
  protected readonly changes = signal(0);
}
