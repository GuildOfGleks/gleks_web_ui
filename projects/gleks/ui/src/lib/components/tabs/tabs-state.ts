import { InjectionToken, Signal } from '@angular/core';

/**
 * What a `gog-tab` needs from the `gog-tabs` it sits in: which tab is currently showing.
 *
 * A token rather than injecting the component directly, purely to keep the import graph
 * acyclic — `tabs.component.ts` has to import `TabComponent` for its `contentChildren`, so the
 * tab cannot import the group back. Both sides depend on this file, which depends on neither.
 */
export interface GogTabsState {
  /** The active tab instance, compared by identity. `null` when the group has no tabs. */
  readonly activeTab: Signal<unknown | null>;
}

export const GOG_TABS_STATE = new InjectionToken<GogTabsState>('GOG_TABS_STATE');
