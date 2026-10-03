import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SliderComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ReactiveFormsModule, SliderComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own sliders.
  providers: [provideGogConfig({ control: { errorDisplay: 'auto' } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderConfigExample {
  // One control each, so touching one does not reveal the other's error.
  protected readonly fromConfig = new FormControl(10, {
    nonNullable: true,
    validators: [Validators.min(20)],
  });
  protected readonly manual = new FormControl(10, {
    nonNullable: true,
    validators: [Validators.min(20)],
  });
}
