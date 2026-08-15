import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TextareaComponent],
})
export class TextareaErrorExample {
  protected readonly value = signal('');
}
