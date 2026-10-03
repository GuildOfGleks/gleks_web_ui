import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ReactiveFormsModule, SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderFormsExample {
  protected readonly control = new FormControl(10, {
    nonNullable: true,
    validators: [Validators.min(20)],
  });

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }
}
