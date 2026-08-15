import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatepickerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DatepickerComponent, ReactiveFormsModule],
})
export class DatepickerFormsExample {
  protected readonly deadline = new FormControl<Date | null>(null, Validators.required);

  protected readonly weekends = (date: Date): boolean => {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };
}
