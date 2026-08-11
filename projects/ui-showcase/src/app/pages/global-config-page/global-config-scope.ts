import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AutocompleteComponent,
  ButtonComponent,
  DatepickerComponent,
  GogTooltipDirective,
  InputfieldComponent,
  ScrollComponent,
  SelectComponent,
  TextareaComponent,
  provideGogConfig,
} from '@guildofgleks/ui';

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

/**
 * Everything under this component's own template reads `GOG_CONFIG` from an injector that
 * has `provideGogConfig(...)` in its `providers` — scoped to this subtree only, the rest of
 * the page (and the app) is untouched. This is the same call a real app makes once in
 * `app.config.ts` to set it for everything; putting it in a component's own `providers`
 * here is only so this page can show the "before" and "after" side by side without two
 * separate apps.
 *
 * `toast` is deliberately absent from this list — `ToastService` is `providedIn: 'root'` and
 * reads `GOG_CONFIG` once at construction (see its own doc comment), so a component-scoped
 * `provideGogConfig` here would silently never apply to it. The page explains and demos that
 * separately instead of pretending it works the same way as everything below.
 */
@Component({
  selector: 'app-global-config-scope',
  imports: [
    AutocompleteComponent,
    ButtonComponent,
    DatepickerComponent,
    GogTooltipDirective,
    InputfieldComponent,
    ScrollComponent,
    SelectComponent,
    TextareaComponent,
  ],
  templateUrl: './global-config-scope.html',
  styleUrl: './global-config-scope.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideGogConfig({
      button: { debounce: 1500 },
      scroll: { autoHide: false },
      tooltip: { showDelay: 800, hideDelay: 400, position: 'bottom' },
      floatLabel: { variant: 'in' },
      control: { size: 'lg', errorDisplay: 'auto', clearable: true },
      dropdown: { appendToBody: true, filter: true, filterPosition: 'bottom' },
      datepicker: { locale: 'ru-RU', firstDayOfWeek: 1, format: 'dd.MM.yyyy' },
      autocomplete: { searchDebounce: 1000, minLength: 2, openOnFocus: false },
      inputfield: { showSpinButtons: false },
      textarea: { resize: 'both' },
    }),
  ],
})
export class GlobalConfigScopeComponent {
  protected readonly roles = ROLES;
  protected readonly cities = CITIES;

  protected readonly clickCount = signal(0);
  protected readonly emailValue = signal('');
  protected readonly role = signal<number | null>(null);
  protected readonly date = signal<Date | null>(null);
  protected readonly city = signal<number | null>(null);
  protected readonly amount = signal('');
  protected readonly notes = signal('');
  protected readonly paragraphs = Array.from(
    { length: 8 },
    (_, i) => `Configured paragraph ${i + 1} — this scrollbar never auto-hides.`,
  );

  protected onClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  protected reset(): void {
    this.clickCount.set(0);
  }
}
