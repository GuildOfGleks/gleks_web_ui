import { Component, signal } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: ` <gog-select label="Plan" [clearable]="true" [options]="plans" [(value)]="plan" /> `,
})
export class SelectClearableExample {
  protected readonly plans = [
    { id: 'free', name: 'Free' },
    { id: 'pro', name: 'Pro' },
    { id: 'team', name: 'Team' },
  ];
  protected readonly plan = signal<string | number | null>('pro');
}
