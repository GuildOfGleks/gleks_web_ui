import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteComponent, GogDropdownOptionDirective, GogSize } from '@guildofgleks/ui';

/** A consumer's own DTO, nested on purpose — the accessors read it with a dot-path. */
interface Employee {
  uuid: string;
  profile: { fullName: string; role: string };
  suspended?: boolean;
}

const EMPLOYEES: Employee[] = [
  { uuid: 'e1', profile: { fullName: 'Alina Kovalenko', role: 'Design' } },
  { uuid: 'e2', profile: { fullName: 'Borys Shevchuk', role: 'Frontend' } },
  { uuid: 'e3', profile: { fullName: 'Vira Marchenko', role: 'Backend' }, suspended: true },
  { uuid: 'e4', profile: { fullName: 'Halyna Bondar', role: 'QA' } },
  { uuid: 'e5', profile: { fullName: 'Dmytro Lysenko', role: 'Frontend' } },
  { uuid: 'e6', profile: { fullName: 'Olena Tkachenko', role: 'Product' } },
];

const CITIES = [
  'Amsterdam',
  'Athens',
  'Barcelona',
  'Berlin',
  'Bratislava',
  'Brussels',
  'Budapest',
  'Copenhagen',
  'Dublin',
  'Helsinki',
  'Kyiv',
  'Lisbon',
  'Ljubljana',
  'Madrid',
  'Oslo',
  'Paris',
  'Prague',
  'Riga',
  'Rome',
  'Sofia',
  'Stockholm',
  'Tallinn',
  'Vienna',
  'Vilnius',
  'Warsaw',
  'Zagreb',
].map((name, index) => ({ id: index + 1, name }));

/** Stands in for a dataset too large to hand over up front — 200 rows, loaded 20 at a time. */
const HUGE_SOURCE = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  name: `Contact #${index + 1}`,
}));
const PAGE_SIZE = 20;

@Component({
  selector: 'app-autocomplete-page',
  imports: [AutocompleteComponent, GogDropdownOptionDirective, ReactiveFormsModule],
  templateUrl: './autocomplete-page.html',
  styleUrl: './autocomplete-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompletePage implements OnDestroy {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly cities = CITIES;
  protected readonly employees = EMPLOYEES;

  protected readonly city = signal<number | null>(null);
  protected readonly employee = signal<Employee | null>(null);
  protected readonly formCity = new FormControl<number | null>(11);

  /** Server-backed demo: `filterLocal` is off, so this list is used exactly as returned. */
  protected readonly remoteResults = signal(CITIES);
  protected readonly remoteLoading = signal(false);
  protected readonly lastQuery = signal('');
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Load-more demo: only one page of `HUGE_SOURCE` is ever handed to the component at once. */
  protected readonly loadedContacts = signal(HUGE_SOURCE.slice(0, PAGE_SIZE));
  protected readonly loadMoreLoading = signal(false);
  private loadMoreTimer: ReturnType<typeof setTimeout> | null = null;

  /** Stands in for an HTTP call: a deliberate 600 ms so the spinner is visible. */
  protected search(query: string): void {
    this.lastQuery.set(query);
    if (this.timer) clearTimeout(this.timer);

    this.remoteLoading.set(true);
    this.timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      this.remoteResults.set(
        needle === ''
          ? CITIES
          : CITIES.filter((city) => city.name.toLowerCase().startsWith(needle)),
      );
      this.remoteLoading.set(false);
      this.timer = null;
    }, 600);
  }

  /**
   * A `gogDropdownOption` template's context is typed from the directive, which cannot infer
   * `TOption` when it is declared standalone in a template — the documented ergonomic cost of
   * the components being generic. One cast at the boundary keeps the template itself typed.
   */
  protected asEmployee(option: unknown): Employee {
    return option as Employee;
  }

  /** Appends the next page of `HUGE_SOURCE` — stands in for a paginated API call. */
  protected loadMoreContacts(): void {
    const loaded = this.loadedContacts().length;
    if (loaded >= HUGE_SOURCE.length || this.loadMoreLoading()) return;

    this.loadMoreLoading.set(true);
    if (this.loadMoreTimer) clearTimeout(this.loadMoreTimer);
    this.loadMoreTimer = setTimeout(() => {
      this.loadedContacts.set(HUGE_SOURCE.slice(0, loaded + PAGE_SIZE));
      this.loadMoreLoading.set(false);
      this.loadMoreTimer = null;
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.loadMoreTimer) clearTimeout(this.loadMoreTimer);
  }
}
