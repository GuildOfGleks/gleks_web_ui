import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadioGroupComponent, GogRadioOption } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupOverviewExample {
  protected readonly options: readonly GogRadioOption[] = [
    { id: 'standard', label: 'Standard — 3 to 5 days' },
    { id: 'express', label: 'Express — next day' },
    { id: 'pickup', label: 'Collect in store' },
  ];
  protected readonly delivery = signal<string | number | null>('standard');
}
