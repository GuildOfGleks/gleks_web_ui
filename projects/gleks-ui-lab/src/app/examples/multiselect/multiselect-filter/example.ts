import { Component, signal } from '@angular/core';
import { MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [MultiselectComponent],
})
export class MultiselectFilterExample {
  protected readonly countries = [
    { id: 'de', name: 'Germany' },
    { id: 'nl', name: 'Netherlands' },
    { id: 'pt', name: 'Portugal' },
    { id: 'ua', name: 'Ukraine' },
  ];

  // With a filter active, "select all" takes only what is visible.
  protected readonly selected = signal<(string | number)[]>([]);
}
