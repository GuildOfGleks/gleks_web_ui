import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  GogTabContentDirective,
  GogTabHeaderDirective,
  GogTabsAlign,
  SpinnerComponent,
  TabComponent,
  TabsComponent,
  TagComponent,
} from '@guildofgleks/ui';

import { LazyPanel } from './lazy-panel';
import { RemoteTabPanel } from './remote-tab-panel';

/** A row a real app would get from an HTTP call — the tab list itself, not just its content. */
interface RemoteSection {
  id: number;
  label: string;
  body: string;
}

const REMOTE_SECTIONS: RemoteSection[] = [
  { id: 1, label: 'Overview', body: 'High-level summary pulled from the reporting service.' },
  { id: 2, label: 'Revenue', body: 'Monthly revenue, broken down by region.' },
  { id: 3, label: 'Expenses', body: 'Cost centers and their month-over-month deltas.' },
  { id: 4, label: 'Headcount', body: 'Team size by department.' },
  { id: 5, label: 'Forecast', body: 'Next-quarter projection.' },
];

@Component({
  selector: 'app-tabs-page',
  imports: [
    ButtonComponent,
    GogTabContentDirective,
    GogTabHeaderDirective,
    LazyPanel,
    RemoteTabPanel,
    SpinnerComponent,
    TabComponent,
    TabsComponent,
    TagComponent,
  ],
  templateUrl: './tabs-page.html',
  styleUrl: './tabs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage implements OnDestroy {
  protected readonly aligns: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
  protected readonly manyTabs = Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`);

  protected readonly index = signal(0);
  protected readonly archiveDisabled = signal(true);
  protected readonly lastChange = signal<number | null>(null);

  protected readonly overflowIndex = signal(0);
  protected readonly overflowScrollActive = signal(true);

  /**
   * `null` until the first load and while a reload is in flight. `<gog-tabs>` stays mounted
   * with zero `<gog-tab>` children the whole time — the case that actually exercises the
   * header row going from empty to populated, rather than `<gog-tabs>` itself only ever
   * appearing once the data is already there.
   *
   * Loading starts on a click, not automatically on mount: an SSR page that flips this on its
   * own shortly after render risks a hydration mismatch if the client hydrates any slower than
   * that delay (very possible against dev-server compilation, and not something worth
   * building a demo that can flake on). Every other async demo in this showcase (autocomplete's
   * remote search, the catalog filters) is user-triggered for the same reason.
   */
  protected readonly remoteSections = signal<RemoteSection[] | null>(null);
  protected readonly remoteLoading = signal(false);
  private remoteTimer: ReturnType<typeof setTimeout> | null = null;

  protected toggleArchive(): void {
    this.archiveDisabled.update((value) => !value);
  }

  protected toggleOverflowScrollActive(): void {
    this.overflowScrollActive.update((value) => !value);
  }

  /** Stands in for an HTTP call for the section list itself. */
  protected loadRemoteSections(): void {
    this.remoteSections.set(null);
    this.remoteLoading.set(true);
    if (this.remoteTimer) clearTimeout(this.remoteTimer);
    this.remoteTimer = setTimeout(() => {
      this.remoteSections.set(REMOTE_SECTIONS);
      this.remoteLoading.set(false);
      this.remoteTimer = null;
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.remoteTimer) clearTimeout(this.remoteTimer);
  }
}
