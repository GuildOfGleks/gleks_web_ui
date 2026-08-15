import { Component, signal } from '@angular/core';
import { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  template: `
    <gog-radio-group label="Delivery" [options]="deliveryOptions" [(value)]="delivery" />
  `,
})
export class RadioGroupOverviewExample {
  protected readonly deliveryOptions: GogRadioOption[] = [
    { id: 'standard', label: 'Standard — 3 to 5 days' },
    { id: 'express', label: 'Express — next day' },
    { id: 'pickup', label: 'Collect in store' },
    { id: 'drone', label: 'Drone drop', disabled: true },
  ];
  protected readonly delivery = signal<string | number | null>('standard');
}
