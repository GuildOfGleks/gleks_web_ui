import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioGroupComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [RadioGroupComponent, ReactiveFormsModule],
})
export class RadioGroupFormsExample {
  protected readonly deliveryOptions = [
    { id: 'standard', label: 'Standard — 3 to 5 days' },
    { id: 'express', label: 'Express — next day' },
    { id: 'pickup', label: 'Collect in store' },
    { id: 'drone', label: 'Drone drop (unavailable in your area)', disabled: true },
  ];

  protected readonly shipping = new FormControl<string | null>(null, Validators.required);
}
