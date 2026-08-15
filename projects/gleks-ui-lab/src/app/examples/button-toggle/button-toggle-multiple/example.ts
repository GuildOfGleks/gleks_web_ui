import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonToggleGroupComponent],
})
export class ButtonToggleMultipleExample {
  protected readonly formats = [
    { id: 'bold', name: 'Bold' },
    { id: 'italic', name: 'Italic' },
    { id: 'underline', name: 'Underline' },
  ];

  // With multiple on, value is an array.
  protected readonly activeFormats = signal<unknown>(['bold']);
}
