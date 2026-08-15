import { Component, signal } from '@angular/core';
import { InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [InputfieldComponent],
})
export class InputfieldPasswordExample {
  protected readonly password = signal('');
}
