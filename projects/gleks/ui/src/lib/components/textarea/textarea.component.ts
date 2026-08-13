import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  DoCheck,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { nextGogControlId } from '../../shared/control-id';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogClearableState } from '../../shared/clearable-state';
import { GogFloatLabelState } from '../../shared/float-label-state';
import { GogFloatLabelVariant, GogSize, GogTextareaResize } from '../../shared/types';
import { IconComponent } from '../icon/icon.component';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
/** Matches the native `<textarea>`'s own out-of-the-box behaviour. */
const DEFAULT_RESIZE: GogTextareaResize = 'vertical';
const DEFAULT_CLEAR_LABEL = 'Clear';

@Component({
  selector: 'gog-textarea',
  imports: [IconComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Drives the :host(.gog-host--auto-width) rule in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Inverted from gog-button's
    // full-width class: this field is full width by default, so the class only appears
    // once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class TextareaComponent implements ControlValueAccessor, DoCheck {
  readonly label = input('');
  readonly placeholder = input('');
  readonly errorMessage = input('');
  /**
   * See `GogErrorDisplay`. Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to
   * `'manual'` — matching every other control in the library.
   */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly name = input('');
  /**
   * The `<textarea>`'s `id`. Left unset, the field generates one — see
   * `gog-inputfield`'s own `inputId` for why that is the default rather than an opt-in.
   */
  readonly inputId = input('');
  readonly disabled = input(false);
  /**
   * Native `readonly` — see `gog-inputfield`'s own `readonly` for how it differs from
   * `disabled`. Suppresses the clear button while on.
   */
  readonly readonly = input(false);
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  /** Native `rows` attribute, controlling the field's initial height. */
  readonly rows = input(4);
  /** Native `maxlength`. Unset (`null`), no limit is applied. */
  readonly maxlength = input<number | null>(null);
  /** Native `minlength`. Unset (`null`), no minimum is applied. */
  readonly minlength = input<number | null>(null);
  /** Native `spellcheck`. Unset (`null`), the browser's own default applies. */
  readonly spellcheck = input<boolean | null>(null);
  /**
   * Which direction(s) the field's own drag handle resizes it in — matches the native CSS
   * `resize` value space (`'vertical'`, `'horizontal'`, `'both'`, `'none'`). Unset, falls back
   * to `GOG_CONFIG.textarea.resize`, then to `'vertical'`, matching a plain `<textarea>`. The
   * handle itself is restyled to be more visible than the browser's default glyph; `'none'`
   * removes it entirely.
   */
  readonly resize = input<GogTextareaResize | undefined>(undefined);
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the field to fit its content instead.
   */
  readonly fullWidth = input(true);
  /**
   * Whether to offer a clear button once the field has text. Unset, falls back to
   * `GOG_CONFIG.control.clearable`, then to `false`.
   */
  readonly clearable = input<boolean | undefined>(undefined);
  /** Accessible name for the clear button. Unset, falls back to `GOG_CONFIG.labels.clear`. */
  readonly clearAriaLabel = input<string | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.variant`, then to `'none'` (off). */
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.showPlaceholder`, then to `false`. */
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);

  /** Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`. */
  readonly value = model<string>('');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cvaDisabled = signal(false);
  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  protected readonly resolvedResize = computed(() =>
    resolveConfigured(this.resize(), this.globalConfig.textarea?.resize, DEFAULT_RESIZE),
  );
  private readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(
      this.errorDisplay(),
      this.globalConfig.control?.errorDisplay,
      DEFAULT_ERROR_DISPLAY,
    ),
  );
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );
  /** Set from `(focus)`/`(blur)` on the `<textarea>` — see `onFocus`/`onBlur`. */
  protected readonly isFocused = signal(false);

  private readonly fieldRef = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');
  /**
   * Width of the textarea's own scrollbar, published so the clear button can clear it.
   *
   * It has to be measured: the width is platform- and settings-dependent (0 on overlay
   * scrollbars, ~15-19px on classic ones), and it only exists once the content overflows. The
   * pure-CSS alternative, `scrollbar-gutter: stable`, reserves the gutter even when the field
   * isn't scrolling, which shifts the resting layout of every textarea.
   */
  protected readonly scrollbarWidth = signal(0);
  /**
   * How far the field's own right/bottom edge currently sits from its container's — 0 unless
   * the user has dragged the resize handle to make the field narrower/shorter than its
   * container. The resize grip is anchored to the container (a `<textarea>` can't reliably
   * host `::after`), so without this it stays put at the container's original corner instead
   * of following the field's own as it's resized.
   */
  protected readonly resizeInsetRight = signal(0);
  protected readonly resizeInsetBottom = signal(0);

  /**
   * The single size modifier, replacing one `[class.gog-input-wrapper--<size>]` binding per size.
   * Empty for `'md'`: that is this component's default size and has no modifier rule of its own — every `gog-input-wrapper--*` chain bottoms out at it.
   */
  protected readonly sizeClass = computed(() =>
    this.resolvedSize() === 'md' ? '' : `gog-input-wrapper--${this.resolvedSize()}`,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /** Disabled and read-only both refuse edits — see `gog-inputfield`. */
  protected readonly isNotEditable = computed(() => this.isDisabled() || this.readonly());
  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedClearLabel = computed(() =>
    resolveConfigured(this.clearAriaLabel(), this.globalConfig.labels?.clear, DEFAULT_CLEAR_LABEL),
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  /** Fallback id, generated once per instance — see `resolvedInputId`. */
  private readonly autoId = nextGogControlId('gog-textarea');
  /** The consumer's `inputId` when given, otherwise the generated one. Never empty. */
  protected readonly resolvedInputId = computed(() => this.inputId() || this.autoId);
  /** Non-null only while the error element is actually rendered — see `gog-inputfield`. */
  protected readonly errorId = computed(() =>
    this.visibleError() ? `${this.resolvedInputId()}-error` : null,
  );

  private readonly floatLabelState = new GogFloatLabelState(
    this.floatLabel,
    this.floatLabelShowPlaceholder,
    this.placeholder,
    this.isFocused,
    // "Has content" for a textarea is simply a non-empty value.
    computed(() => this.value() !== ''),
    this.globalConfig,
  );

  private readonly clearableState = new GogClearableState(
    this.clearable,
    computed(() => this.value() !== ''),
    this.isNotEditable,
    this.globalConfig,
    () => false,
  );
  /** Whether to render the clear button right now — see `GogClearableState`. */
  protected readonly showClear = this.clearableState.isVisible;

  protected readonly resolvedFloatLabel = this.floatLabelState.variant;
  protected readonly isFloatLabelActive = this.floatLabelState.isActive;
  protected readonly isFloatLabelFloated = this.floatLabelState.isFloated;
  protected readonly effectivePlaceholder = this.floatLabelState.effectivePlaceholder;

  private _onChange: (val: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor() {
    // Re-measured after every render: the scrollbar appears and disappears as the content grows
    // past the visible rows, and `rows`/`size` can change it too.
    afterRenderEffect(() => {
      const el = this.fieldRef().nativeElement;
      // touch the value so this re-runs as the content changes
      this.value();
      this.scrollbarWidth.set(el.offsetWidth - el.clientWidth);
    });

    // Tracks manual drags of the resize handle — see `resizeInsetRight`/`resizeInsetBottom`.
    // A plain `afterRenderEffect` can't see this: dragging the handle doesn't touch any
    // Angular-owned state, so nothing would ever re-run it; a `ResizeObserver` is the only
    // thing that actually notices the field's own box changing size.
    afterNextRender(() => {
      const el = this.fieldRef().nativeElement;
      const container = el.parentElement as HTMLElement;
      // Not implemented by jsdom (so: absent in unit tests) and by very old browsers, which
      // then simply keep the field glued to the container's own corner, as before this input.
      if (typeof ResizeObserver === 'undefined') return;

      const measure = () => {
        this.resizeInsetRight.set(Math.max(0, container.clientWidth - el.offsetWidth));
        this.resizeInsetBottom.set(Math.max(0, container.clientHeight - el.offsetHeight));
      };
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // Registering through NgControl instead of NG_VALUE_ACCESSOR keeps `this.ngControl`
    // available for `hasError` — providing NG_VALUE_ACCESSOR on the component while also
    // injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value.set(textarea.value);
    this._onChange(textarea.value);
  }

  /** Clears the field and notifies any attached form, then returns focus to the input. */
  protected clearValue(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.value.set('');
    this._onChange('');
    this._onTouched();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this._onTouched();
  }
}
