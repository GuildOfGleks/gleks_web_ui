import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatepickerComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerWidthExample {
  protected readonly today = new Date();
}
