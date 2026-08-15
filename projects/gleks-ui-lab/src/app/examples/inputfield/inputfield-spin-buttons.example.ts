import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `
    <gog-inputfield label="Quantity (stepper)" type="number" [min]="0" [(value)]="quantity" />

    <gog-inputfield
      label="Quantity (no stepper)"
      type="number"
      [min]="0"
      [showSpinButtons]="false"
      [(value)]="quantity"
    />

    <!-- clearable and the stepper coexist: the clear button sits left of the stepper. -->
    <gog-inputfield
      label="Weight (clearable + stepper)"
      type="number"
      [min]="0"
      [clearable]="true"
      [(value)]="weight"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 320px;
    }
  `,
})
export class InputfieldSpinButtonsExample {
  protected readonly quantity = signal('3');
  protected readonly weight = signal('72');
}
