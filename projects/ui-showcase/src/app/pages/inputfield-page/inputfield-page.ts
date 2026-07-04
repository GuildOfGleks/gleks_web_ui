import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { InputfieldComponent } from '@gleks/ui';

@Component({
  selector: 'app-inputfield-page',
  imports: [InputfieldComponent],
  templateUrl: './inputfield-page.html',
  styleUrl: './inputfield-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldPage {
  protected readonly name = signal('Ada Lovelace');
  protected readonly email = signal('');
  protected readonly password = signal('');
}
