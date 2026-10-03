import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldNumberDateExample {
  protected readonly quantity = new FormControl<number | null>(3);
  protected readonly delivery = signal('');

  protected typeOf(value: unknown): string {
    return value === null ? 'null' : typeof value;
  }
}
