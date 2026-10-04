import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective, SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionOverlayExample {
  protected readonly items: GogAccordionItem[] = [
    { id: 'profile', title: 'Profile', body: 'Name, photo and the email people see.' },
    { id: 'region', title: 'Region' },
  ];
  // The last item starts open, so its select is one press away.
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set(['region']));
  protected readonly timezones = [
    'Europe/Kyiv',
    'Europe/Berlin',
    'Europe/Lisbon',
    'America/New_York',
    'Asia/Tokyo',
  ].map((zone) => ({ id: zone, name: zone }));
  protected readonly timezone = signal<string | number | null>('Europe/Kyiv');
}
