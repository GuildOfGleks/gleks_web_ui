import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadioGroupComponent, GogRadioOption } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupOptionsExample {
  protected readonly seats: readonly GogRadioOption[] = [
    { id: 1, label: '1 seat' },
    { id: 5, label: '5 seats' },
    { id: 25, label: '25 seats' },
  ];
  protected readonly offline: readonly GogRadioOption[] = [
    { id: 'keep', label: 'Keep a copy on this device and sync changes when a connection is back' },
    { id: 'discard', label: 'Discard local changes' },
  ];
  protected readonly seatCount = signal<string | number | null>(5);

  protected typeOf(value: unknown): string {
    return value === null ? 'null' : typeof value;
  }
}
