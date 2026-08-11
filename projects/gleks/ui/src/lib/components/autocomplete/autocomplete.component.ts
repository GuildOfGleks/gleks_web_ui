import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { GogDropdownBase, type GogDropdownOption } from '../../shared/dropdown-base';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { IconComponent } from '../icon/icon.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { SpinnerComponent } from '../spinner/spinner.component';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SEARCH_DEBOUNCE = 300;
const DEFAULT_MIN_LENGTH = 1;
const DEFAULT_OPEN_ON_FOCUS = true;

/**
 * A text field that suggests options as you type.
 *
 * ```html
 * <gog-autocomplete
 *   [options]="users"
 *   optionLabel="profile.fullName"
 *   [optionValue]="null"
 *   [(value)]="user"
 *   (gogSearch)="load($event)"
 *   [loading]="loading()"
 * />
 * ```
 *
 * Shares `GogDropdownBase` with `gog-select` — placement, the append-to-body overlay, the
 * option accessors, float label, error state and `ControlValueAccessor` all come from there.
 * What makes it a separate control rather than a mode of `gog-select` is the trigger: here it
 * is a real `<input>`, which changes the ARIA contract completely. The input keeps DOM focus
 * the whole time and the highlighted option is pointed at with `aria-activedescendant`, where
 * a listbox moves focus onto the option itself.
 */
@Component({
  selector: 'gog-autocomplete',
  imports: [IconComponent, NgTemplateOutlet, ScrollComponent, SpinnerComponent],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Only bites when the control has opted out of full width; otherwise the container decides.
    '[style.--gog-autocomplete-min-width]': 'minWidth()',
  },
})
export class AutocompleteComponent<
  TOption = GogDropdownOption,
  TValue = string | number | null,
> extends GogDropdownBase<TValue, TOption> {
  readonly inputId = input('');

  /**
   * Two-way bindable selected value: `[(value)]="signal"`. Carries whatever `optionValue`
   * resolves to — an id by default, or the option object itself when `optionValue` is `null`.
   */
  readonly value = model<TValue>(null as TValue);

  /**
   * Whether to narrow `options` in the browser as the user types.
   *
   * Leave it on for a list you already hold. Turn it **off** when `gogSearch` fetches an
   * already-filtered list from a server: filtering that answer a second time against the same
   * query is the classic double-filtering bug, and it silently drops rows whose match the
   * server found in a field this component cannot see.
   */
  readonly filterLocal = input(true);
  /** How many characters before the panel opens at all. */
  readonly minLength = input<number | undefined>(undefined);
  /**
   * Whether focusing the field opens the panel immediately, showing the full option list —
   * before `minLength` would otherwise have let anything through. Off, the field behaves as
   * before: nothing opens until enough has been typed. Unset, falls back to
   * `GOG_CONFIG.autocomplete.openOnFocus`, then to `true`.
   */
  readonly openOnFocus = input<boolean | undefined>(undefined);
  /** Milliseconds of quiet before `gogSearch` fires. `0` emits on every keystroke. */
  readonly searchDebounce = input<number | undefined>(undefined);
  /** Shows a spinner in the trailing slot — for a server-backed source that is still loading. */
  readonly loading = input(false);
  /** Shown in place of the list when nothing matches. */
  readonly emptyMessage = input('No matches');
  /**
   * Whether free text that matches no option is discarded when the field loses focus.
   *
   * On (the default) the field always ends up reflecting a real selection: editing is treated
   * as transient, so the current `value` survives keystrokes and Escape or blur snaps the text
   * back to it.
   *
   * Off, what the user typed is itself meaningful — a create-as-you-type flow. The text is left
   * alone on blur and `value` is dropped as soon as it stops matching, so the two never
   * disagree. Read the typed text from `gogSearch` rather than from `value`.
   */
  readonly forceSelection = input(true);

  /** The current query, debounced. Wire a server-side lookup to this. */
  readonly gogSearch = output<string>();
  /**
   * Fires when the panel is scrolled to the end of the option list — the signal to fetch and
   * append another page of a large or server-backed source, rather than handing the whole
   * thing over up front. Forwarded from the panel's own `gog-scroll`.
   */
  readonly gogLoadMore = output<void>();

  protected readonly panelTemplate = viewChild<TemplateRef<unknown>>('panelTpl');
  /** A cleared autocomplete is `null`, whatever `TValue` the consumer bound. */
  protected readonly emptyValue = null as TValue;
  protected readonly optionClass = 'gog-autocomplete__option';
  protected readonly triggerClass = 'gog-autocomplete__control';
  protected readonly sizeBlockClass = 'gog-autocomplete';
  protected readonly panelBlockClass = 'gog-autocomplete__dropdown';
  /** Opt-in, matching `gog-select` and `gog-inputfield`. */
  protected readonly clearableByDefault = false;
  protected override readonly optionGapToken = '--gog-autocomplete-option-gap';
  protected override readonly panelMaxHeightToken = '--gog-autocomplete-panel-max-height';
  protected override readonly optionHeightToken = '--gog-autocomplete-option-height';

  private readonly config = inject(GOG_CONFIG);
  private readonly ownDestroyRef = inject(DestroyRef);

  protected readonly triggerId = computed(() => this.inputId() || `gog-autocomplete-${this.uid}`);
  protected readonly listboxId = computed(() => `${this.triggerId()}-listbox`);
  protected readonly labelId = computed(() => `${this.triggerId()}-label`);
  protected readonly errorId = computed(() =>
    this.hasError() ? `${this.triggerId()}-error` : null,
  );
  protected optionId(index: number): string {
    return `${this.triggerId()}-option-${index}`;
  }

  protected readonly resolvedMinLength = computed(() =>
    resolveConfigured(this.minLength(), this.config.autocomplete?.minLength, DEFAULT_MIN_LENGTH),
  );
  private readonly resolvedDebounce = computed(() =>
    resolveConfigured(
      this.searchDebounce(),
      this.config.autocomplete?.searchDebounce,
      DEFAULT_SEARCH_DEBOUNCE,
    ),
  );
  protected readonly resolvedOpenOnFocus = computed(() =>
    resolveConfigured(
      this.openOnFocus(),
      this.config.autocomplete?.openOnFocus,
      DEFAULT_OPEN_ON_FOCUS,
    ),
  );

  /** What is actually in the `<input>`. Not the same thing as the committed `value`. */
  protected readonly query = signal('');
  /**
   * True right after `openOnFocus` opens the panel, until the user actually types. The field
   * may already be showing a previously-selected label at that point — this keeps the panel's
   * list unfiltered by it, so focusing shows every option rather than just the one that
   * happens to match the current text. Cleared on the first keystroke, so filtering resumes
   * exactly as before.
   */
  protected readonly browsingAll = signal(false);
  /**
   * Which option the arrows have highlighted. `-1` means none — Enter then does nothing rather
   * than committing whichever row happened to be first, which is what stops a fast typist from
   * selecting something they never looked at.
   */
  protected readonly activeIndex = signal(-1);

  protected readonly selectedOption = computed(
    () =>
      this.options().find((option) => this.sameValue(this.valueOf(option), this.value())) ?? null,
  );
  protected readonly selectedLabel = computed(() => {
    const option = this.selectedOption();
    return option === null ? '' : this.labelOf(option);
  });
  protected readonly hasFloatValue = computed(() => this.value() != null || this.query() !== '');

  /**
   * Local filtering, replacing the base's panel-filter behaviour: here the query comes from the
   * trigger, not from a search box inside the panel. Overriding this rather than duplicating a
   * second filtered list keeps the keyboard targets, the empty state and the panel height
   * estimate all reading the same set.
   */
  protected override readonly visibleOptions = computed(() => {
    const query = this.browsingAll() ? '' : this.query().trim();
    if (!this.filterLocal() || query === '') return this.options();

    const match = this.filterMatch();
    if (match) return this.options().filter((option) => match(option, query));

    const needle = query.toLowerCase();
    return this.options().filter((option) => this.labelOf(option).toLowerCase().includes(needle));
  });

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 && index < this.visibleOptions().length ? this.optionId(index) : null;
  });

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.ownDestroyRef.onDestroy(() => this.cancelPendingSearch());

    // Keep the field showing the selection whenever the user is not mid-edit. Covers a value
    // written by a form, a `[(value)]` set from outside, and the options arriving after the
    // value did — which is the normal order for a server-backed control.
    effect(() => {
      const label = this.selectedLabel();
      if (!this.isOpen() && label !== '') {
        this.query.set(label);
      }
    });
  }

  protected isSelected(option: TOption): boolean {
    return this.sameValue(this.valueOf(option), this.value());
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.browsingAll.set(false);
    this.query.set(text);
    this.activeIndex.set(-1);

    // Whether editing over a selection drops it depends on which mode this is in.
    //
    // With `forceSelection` off, free text is itself the answer, so the moment it diverges from
    // the selected option the value no longer describes what the field shows and has to go.
    //
    // With it on, the edit is *transient* — Escape or blur snaps the field back to the
    // selection — so the value is kept until one of those resolves it. Dropping it per
    // keystroke instead would mean a user who types one character to refine their search and
    // then changes their mind has silently lost what they had picked.
    if (!this.forceSelection() && this.value() != null && text !== this.selectedLabel()) {
      this.commitValue(this.emptyValue);
    }

    if (text.trim().length >= this.resolvedMinLength()) {
      this.open();
    } else {
      this.close();
    }

    this.scheduleSearch(text);
  }

  /**
   * The input owns its arrow keys; the base's option-focusing handlers are deliberately not
   * wired up here. Moving DOM focus into the list would take the caret out of the field, which
   * is exactly what a combobox must not do.
   */
  protected onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
          return;
        }
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      case 'Home':
      case 'End': {
        if (!this.isOpen()) return;
        // Only claimed while the list is showing — otherwise Home/End belong to the caret.
        event.preventDefault();
        this.setActive(event.key === 'Home' ? 0 : this.visibleOptions().length - 1);
        return;
      }
      case 'Enter': {
        const option = this.visibleOptions()[this.activeIndex()];
        if (this.isOpen() && option) {
          event.preventDefault();
          this.pick(option);
        }
        return;
      }
      case 'Escape': {
        if (!this.isOpen()) return;
        event.preventDefault();
        this.close();
        this.restoreSelectedText();
        return;
      }
      case 'Tab': {
        // Not prevented: the panel closes and the browser's own Tab handling carries on.
        this.close();
        return;
      }
    }
  }

  protected onOptionClick(option: TOption, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.pick(option);
  }

  /**
   * Keeps the caret in the field while an option is clicked. Without it the input blurs first,
   * `forceSelection` wipes the text, and the click lands on a list that has already closed.
   */
  protected onOptionMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onInputFocus(): void {
    this.onFocusIn();

    if (this.resolvedOpenOnFocus() && !this.isOpen()) {
      this.browsingAll.set(true);
      this.open();
    }
  }

  protected onInputBlur(): void {
    this.onFocusOut();
    this.close();

    if (this.forceSelection()) {
      this.restoreSelectedText();
    }
  }

  protected override close(): void {
    super.close();
    this.activeIndex.set(-1);
    this.browsingAll.set(false);
  }

  /** Clearing has to empty the *text* as well; the base only knows about the value. */
  protected override clearValue(event: Event): void {
    super.clearValue(event);
    this.query.set('');
    this.cancelPendingSearch();
    this.gogSearch.emit('');
  }

  private pick(option: TOption): void {
    if (this.isOptionDisabled(option)) return;

    this.commitValue(this.valueOf(option) as TValue);
    this.query.set(this.labelOf(option));
    this.close();
    this.cancelPendingSearch();
  }

  /** Snaps the field back to whatever `value` holds — the empty string when nothing is picked. */
  private restoreSelectedText(): void {
    this.query.set(this.selectedLabel());
  }

  private moveActive(step: number): void {
    const count = this.visibleOptions().length;
    if (count === 0) return;

    const current = this.activeIndex();
    // From "nothing highlighted", ArrowDown starts at the top and ArrowUp at the bottom.
    const next = current === -1 ? (step > 0 ? 0 : count - 1) : (current + step + count) % count;
    this.setActive(next);
  }

  private setActive(index: number): void {
    const count = this.visibleOptions().length;
    if (count === 0 || index < 0 || index >= count) return;

    this.activeIndex.set(index);
    this.scrollActiveIntoView(index);
  }

  private scrollActiveIntoView(index: number): void {
    if (!this.isBrowser) return;

    // The highlighted row is not focused, so nothing scrolls it into view for us.
    queueMicrotask(() => {
      const option = document.getElementById(this.optionId(index));
      // Feature-detected rather than assumed: this runs in a microtask, so a host without
      // `scrollIntoView` (jsdom, for one) would throw where nothing can catch it, and an
      // unhandled rejection fails the whole test run rather than just this line.
      if (typeof option?.scrollIntoView === 'function') {
        option.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  private scheduleSearch(query: string): void {
    this.cancelPendingSearch();

    const delay = this.resolvedDebounce();
    if (delay <= 0) {
      this.gogSearch.emit(query);
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      this.gogSearch.emit(query);
    }, delay);
  }

  private cancelPendingSearch(): void {
    if (this.searchTimer !== null) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
}
