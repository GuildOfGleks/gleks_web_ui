import { Component, signal } from '@angular/core';
import { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  template: `
    <gog-radio-group
      label="Billing"
      orientation="horizontal"
      [options]="planOptions"
      [(value)]="plan"
    />
  `,
})
export class RadioGroupOrientationExample {
  protected readonly planOptions: GogRadioOption[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];
  protected readonly plan = signal<string | number | null>('yearly');
}
