import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@guildofgleks/ui';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerFormsExample {
  protected readonly control = new FormControl<GogDatepickerValue>(null, Validators.required);

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }

  /** A Date in single mode, a { start, end } pair in range mode. */
  protected show(value: GogDatepickerValue): string {
    if (value instanceof Date) return value.toLocaleString('en-GB');
    if (value) {
      const start = value.start?.toLocaleDateString('en-GB') ?? '…';
      const end = value.end?.toLocaleDateString('en-GB') ?? '…';
      return `${start} – ${end}`;
    }
    return 'null';
  }
}
