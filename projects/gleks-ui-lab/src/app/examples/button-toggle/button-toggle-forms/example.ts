import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonToggleGroupComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleFormsExample {
  protected readonly alignments = [
    { id: 'left', name: 'Left' },
    { id: 'center', name: 'Center' },
    { id: 'right', name: 'Right' },
  ];
  protected readonly align = signal<string | null>('left');
  protected readonly changes = signal(0);
  protected readonly control = new FormControl<string | null>('right');

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }
}
