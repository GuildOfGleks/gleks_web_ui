import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatepickerComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerBoundsExample {
  protected readonly today = new Date();
  protected readonly monthStart = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  protected readonly monthEnd = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
  protected readonly nextYear = new Date(this.today.getFullYear() + 1, 0, 1);

  protected readonly noWeekends = (date: Date): boolean =>
    date.getDay() === 0 || date.getDay() === 6;
}
