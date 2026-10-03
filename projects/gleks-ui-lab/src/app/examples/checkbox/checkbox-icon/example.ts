import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CheckboxComponent, GogCheckboxIconDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxIconExample {
  protected readonly starred = signal(true);
}
