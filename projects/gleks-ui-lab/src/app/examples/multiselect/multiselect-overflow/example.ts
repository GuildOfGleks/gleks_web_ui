import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectOverflowExample {
  protected readonly countries = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i + 1}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly picked = signal(this.countries.slice(0, 10).map((country) => country.id));
}
