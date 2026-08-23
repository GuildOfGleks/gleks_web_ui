import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AutocompleteComponent,
  ButtonComponent,
  DatepickerComponent,
  GogPanelHeaderDirective,
  GogTooltipDirective,
  InputfieldComponent,
  PanelComponent,
  ScrollComponent,
  SelectComponent,
  TextareaComponent,
  ToastContainerComponent,
  ToastService,
} from '@guildofgleks/ui';

import { GlobalConfigScopeComponent } from './global-config-scope';

interface RoleOption {
  id: number;
  name: string;
}

const ROLES: RoleOption[] = [
  { id: 1, name: 'Member' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Owner' },
];

interface CityOption {
  id: number;
  name: string;
}

const CITIES: CityOption[] = [
  { id: 1, name: 'Amsterdam' },
  { id: 2, name: 'Berlin' },
  { id: 3, name: 'Kyiv' },
  { id: 4, name: 'Lisbon' },
  { id: 5, name: 'Warsaw' },
];

@Component({
  selector: 'app-global-config-page',
  imports: [
    AutocompleteComponent,
    ButtonComponent,
    DatepickerComponent,
    GogPanelHeaderDirective,
    GogTooltipDirective,
    InputfieldComponent,
    PanelComponent,
    ScrollComponent,
    SelectComponent,
    TextareaComponent,
    ToastContainerComponent,
    GlobalConfigScopeComponent,
  ],
  templateUrl: './global-config-page.html',
  styleUrl: './global-config-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalConfigPage {
  private readonly toastService = inject(ToastService);

  protected readonly roles = ROLES;
  protected readonly cities = CITIES;

  protected readonly defaultClickCount = signal(0);
  protected readonly defaultEmailValue = signal('');
  protected readonly defaultRole = signal<number | null>(null);
  protected readonly defaultDate = signal<Date | null>(null);
  protected readonly defaultCity = signal<number | null>(null);
  protected readonly defaultAmount = signal('');
  protected readonly defaultNotes = signal('');
  protected readonly paragraphs = Array.from(
    { length: 8 },
    (_, i) => `Default paragraph ${i + 1} — this scrollbar fades after ~800ms.`,
  );

  protected onDefaultClick(): void {
    this.defaultClickCount.update((count) => count + 1);
  }

  protected resetDefault(): void {
    this.defaultClickCount.set(0);
  }

  protected showDefaultToast(): void {
    this.toastService.show({
      message: 'Untouched GOG_CONFIG.toast — library default (bottom-right, 4000ms).',
    });
  }
}
