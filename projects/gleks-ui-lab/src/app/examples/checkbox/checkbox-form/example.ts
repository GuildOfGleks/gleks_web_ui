import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CheckboxComponent, ReactiveFormsModule],
})
export class CheckboxFormExample {
  protected readonly control = new FormControl(false, { nonNullable: true });
}
