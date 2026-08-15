import { Component, signal } from '@angular/core';
import {
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  IconComponent,
  InputfieldComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    InputfieldComponent,
    GogInputAddonStartDirective,
    GogInputAddonEndDirective,
    IconComponent,
  ],
})
export class InputfieldAddonExample {
  protected readonly amount = signal('');
  protected readonly search = signal('');

  // A plain method on a real button — no callback threaded through the field.
  protected clearSearch(): void {
    this.search.set('');
  }
}
