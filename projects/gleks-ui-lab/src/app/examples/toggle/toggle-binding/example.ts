import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleBindingExample {
  protected readonly dark = signal(false);
  protected readonly changes = signal(0);
}
