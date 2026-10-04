import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ProgressbarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarClampExample {
  protected readonly value = signal(20);
  protected readonly fixedValues = [-20, 140, Number.NaN];
}
