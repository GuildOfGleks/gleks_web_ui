import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleFormsExample {
  protected readonly control = new FormControl(true, { nonNullable: true });

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }
}
