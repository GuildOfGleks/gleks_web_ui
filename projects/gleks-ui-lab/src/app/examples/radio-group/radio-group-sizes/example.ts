import { Component, signal } from '@angular/core';
import { GogSize, RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [RadioGroupComponent],
})
export class RadioGroupSizesExample {
  protected readonly planOptions = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  protected readonly sizeValue = signal<string | null>('monthly');
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
