import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [InputfieldComponent, ReactiveFormsModule],
})
export class InputfieldNumberDateExample {
  // formControl.value is a number here (null when empty) — [(value)] would stay the raw string.
  protected readonly quantityControl = new FormControl<number | null>(1);
  protected readonly deliveryDate = signal('');
}
