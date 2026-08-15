import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatepickerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent, ReactiveFormsModule],
  template: `
    <gog-datepicker
      label="Deadline"
      errorDisplay="auto"
      errorMessage="A deadline is required"
      [clearable]="true"
      [disabledDates]="weekends"
      [formControl]="deadline"
    />
  `,
})
export class DatepickerFormsExample {
  protected readonly deadline = new FormControl<Date | null>(null, Validators.required);

  protected readonly weekends = (date: Date): boolean => {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };
}
