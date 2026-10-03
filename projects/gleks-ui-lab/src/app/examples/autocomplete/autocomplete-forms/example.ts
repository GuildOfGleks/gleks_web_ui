import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutocompleteComponent, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteFormsExample {
  protected readonly cities = [
    { id: 1, name: 'Amsterdam' },
    { id: 2, name: 'Athens' },
    { id: 3, name: 'Barcelona' },
    { id: 4, name: 'Berlin' },
    { id: 5, name: 'Bratislava' },
    { id: 6, name: 'Brussels' },
    { id: 7, name: 'Budapest' },
    { id: 8, name: 'Dublin' },
    { id: 9, name: 'Lisbon' },
    { id: 10, name: 'Zagreb' },
  ];
  protected readonly control = new FormControl<number | null>(null, Validators.required);

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }
}
