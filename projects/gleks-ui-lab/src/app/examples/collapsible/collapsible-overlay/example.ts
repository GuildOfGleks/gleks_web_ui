import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogButtonDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    CollapsibleComponent,
    GogButtonDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    SelectComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleOverlayExample {
  protected readonly open = signal(true);
  protected readonly timezone = signal<string | number | null>(null);
  protected readonly timezones = [
    { id: 'pst', name: 'Pacific Time' },
    { id: 'est', name: 'Eastern Time' },
    { id: 'utc', name: 'UTC' },
    { id: 'wet', name: 'Western European Time' },
    { id: 'cet', name: 'Central European Time' },
    { id: 'eet', name: 'Eastern European Time' },
  ];
}
