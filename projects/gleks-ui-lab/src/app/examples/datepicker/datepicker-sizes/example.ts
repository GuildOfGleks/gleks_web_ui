import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogSize } from '@guildofgleks/ui';
import { DatepickerComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly today = new Date();
}
