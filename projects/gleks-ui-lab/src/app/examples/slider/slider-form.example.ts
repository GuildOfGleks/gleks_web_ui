import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent, ReactiveFormsModule],
  template: `
    <gog-slider
      label="Minimum threshold"
      [min]="0"
      [max]="100"
      [formControl]="minimumControl"
      errorDisplay="auto"
      [errorMessage]="minimumErrorMessage()"
    />
  `,
})
export class SliderFormExample {
  protected readonly minimumControl = new FormControl<number>(10, {
    nonNullable: true,
    validators: Validators.min(50),
  });
  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {
    initialValue: this.minimumControl.value,
  });
  protected readonly minimumErrorMessage = computed(() => {
    this.minimumValue();
    return this.minimumControl.hasError('min') ? 'Must be at least 50.' : '';
  });
}
