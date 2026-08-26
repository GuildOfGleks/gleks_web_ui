import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogDropdownOption,
  GogPanelHeaderDirective,
  PanelComponent,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogPanelHeaderDirective, PanelComponent, SelectComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelOverlayExample {
  protected readonly timezones: GogDropdownOption[] = [
    { id: 'utc', name: 'UTC' },
    { id: 'cet', name: 'Central European Time' },
    { id: 'eet', name: 'Eastern European Time' },
    { id: 'pst', name: 'Pacific Standard Time' },
  ];

  protected readonly plain = signal<string | number | null>(null);
  protected readonly inCollapsible = signal<string | number | null>(null);

  protected readonly regionalOpen = signal(true);
}
