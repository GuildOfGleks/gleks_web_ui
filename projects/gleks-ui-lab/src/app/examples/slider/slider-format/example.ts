import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SliderComponent, type GogSliderRange } from '@guildofgleks/ui';

const EUROS = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderFormatExample {
  protected readonly price = signal<GogSliderRange>({ start: 40, end: 120 });
  protected readonly minutes = signal(90);

  protected readonly euros = (value: number): string => EUROS.format(value);
  protected readonly duration = (value: number): string => {
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return [hours && `${hours} h`, rest && `${rest} min`].filter(Boolean).join(' ');
  };
}
