import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent, ReactiveFormsModule],
  template: `
    <gog-inputfield
      label="Quantity"
      type="number"
      [min]="1"
      [max]="10"
      [step]="1"
      [formControl]="quantityControl"
    />

    <gog-inputfield label="Delivery date" type="date" [(value)]="deliveryDate" />
  `,
})
export class InputfieldNumberDateExample {
  // formControl.value is a number here (null when empty) — [(value)] would stay the raw string.
  protected readonly quantityControl = new FormControl<number | null>(1);
  protected readonly deliveryDate = signal('');
}
