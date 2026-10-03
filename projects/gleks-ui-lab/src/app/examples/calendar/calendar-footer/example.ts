import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarFooterExample {
  protected readonly nextYear = new Date(new Date().getFullYear() + 1, 0, 1);
}
