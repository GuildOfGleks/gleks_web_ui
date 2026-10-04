import { Directive, Signal, computed, contentChild, input, signal } from '@angular/core';

import { configurableBooleanAttribute, resolveConfigured } from './config';
import {
  GogDropdownBase,
  GogDropdownChevronDirective,
  type GogDropdownOption,
} from './dropdown-base';
import { GogDropdownFilterPosition } from './types';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_FILTER = false;
const DEFAULT_FILTER_POSITION: GogDropdownFilterPosition = 'top';

/**
 * `GogDropdownBase` plus what a control whose trigger is a button needs on top of it: a search
 * box inside the panel, and a chevron a consumer can replace. `gog-select` and `gog-multiselect`
 * extend this; `gog-autocomplete` extends `GogDropdownBase` directly, because its trigger *is* the
 * search box and it draws no chevron — until 21.16.0 it inherited these inputs anyway, and they
 * did nothing on it.
 *
 * Exported for the same reason as `GogDropdownBase`: it appears in the public type signatures of
 * the components that extend it. It is not meant to be used or subclassed by consumers.
 */
@Directive()
export abstract class GogFilterableDropdownBase<
  TValue,
  TOption = GogDropdownOption,
> extends GogDropdownBase<TValue, TOption> {
  /**
   * Whether the panel shows a search box that narrows the option list. Unset, falls back to
   * `GOG_CONFIG.dropdown.filter`, then to `false`.
   */
  readonly filter = input<boolean | undefined, unknown>(undefined, {
    transform: configurableBooleanAttribute,
  });
  readonly filterPlaceholder = input('Search...');
  /**
   * Which end of the panel the search box sticks to. Named to match `gog-multiselect`'s
   * `controlsPosition`, which is the same idea for its select-all row. Unset, falls back to
   * `GOG_CONFIG.dropdown.filterPosition`, then to `'top'`.
   */
  readonly filterPosition = input<GogDropdownFilterPosition | undefined>(undefined);
  /** Shown in place of the list when the query matches nothing. */
  readonly filterEmptyMessage = input('No matches');

  /** Projected `gogDropdownChevron` template, replacing the built-in chevron. */
  protected readonly chevronSlot = contentChild(GogDropdownChevronDirective);

  protected readonly resolvedFilter = computed(() =>
    resolveConfigured(this.filter(), this.globalConfig.dropdown?.filter, DEFAULT_FILTER),
  );
  protected readonly resolvedFilterPosition = computed(() =>
    resolveConfigured(
      this.filterPosition(),
      this.globalConfig.dropdown?.filterPosition,
      DEFAULT_FILTER_POSITION,
    ),
  );
  /** Current search text. Cleared whenever the panel closes, so reopening starts fresh. */
  protected readonly filterQuery = signal('');

  protected override readonly visibleOptions: Signal<readonly TOption[]> = computed(() => {
    const query = this.filterQuery().trim();
    if (!this.resolvedFilter() || query === '') return this.options();

    const match = this.filterMatch();
    if (match) return this.options().filter((option) => match(option, query));

    const needle = query.toLowerCase();
    return this.options().filter((option) => this.labelOf(option).toLowerCase().includes(needle));
  });

  protected onFilterInput(event: Event): void {
    this.filterQuery.set((event.target as HTMLInputElement).value);
    // Typing can take 10 000 options to 3. The window's range and the scroller's position have
    // to reset *together*: leave the scroller where it was and the range is computed from a
    // scrollTop that is past the end of the new list, so the panel renders rows 400-420 of a
    // three-row list and shows nothing. The panel still looks right until you type, which is
    // why this is the bug a reviewer does not see.
    this.resetPanelScroll();
  }

  protected override close(): void {
    if (!this.isOpen()) return;
    this.filterQuery.set('');
    super.close();
  }
}
