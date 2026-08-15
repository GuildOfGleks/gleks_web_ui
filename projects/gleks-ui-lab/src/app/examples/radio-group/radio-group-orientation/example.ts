import { Component, signal } from '@angular/core';
import { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [RadioGroupComponent],
})
export class RadioGroupOrientationExample {
  protected readonly planOptions: GogRadioOption[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];
  protected readonly plan = signal<string | number | null>('yearly');
}
