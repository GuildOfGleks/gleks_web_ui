import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent, ReactiveFormsModule],
  template: `
    <gog-select
      label="Billing cycle"
      placeholder="Choose a cycle..."
      [options]="billingCycles"
      [formControl]="billingCycleControl"
      errorMessage="A billing cycle is required."
      errorDisplay="auto"
    />
  `,
})
export class SelectFormExample {
  protected readonly billingCycles: GogDropdownOption[] = [
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly (2 months free)' },
  ];
  protected readonly billingCycleControl = new FormControl<string | number | null>(
    null,
    Validators.required,
  );
}
