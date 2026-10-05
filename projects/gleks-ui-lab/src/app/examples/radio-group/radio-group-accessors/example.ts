import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadioGroupComponent } from '@guildofgleks/ui';

interface Plan {
  code: string;
  title: string;
  status: 'active' | 'retired';
}

interface Address {
  key: number;
  place: { city: string; country: string };
}

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupAccessorsExample {
  protected readonly plans: readonly Plan[] = [
    { code: 'starter', title: 'Starter', status: 'active' },
    { code: 'team', title: 'Team', status: 'active' },
    { code: 'legacy', title: 'Legacy (retired)', status: 'retired' },
  ];
  protected readonly addresses: readonly Address[] = [
    { key: 1, place: { city: 'Lisbon', country: 'PT' } },
    { key: 2, place: { city: 'Tallinn', country: 'EE' } },
  ];
  protected readonly plan = signal<string | number | null>('team');

  protected readonly planCode = (plan: Plan): string => plan.code;
  protected readonly isRetired = (plan: Plan): boolean => plan.status === 'retired';
}
