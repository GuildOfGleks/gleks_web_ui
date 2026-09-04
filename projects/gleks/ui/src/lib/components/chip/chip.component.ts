import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import { type GogIconName, IconComponent } from '../icon/icon.component';
import { GogSize, GogTagShape } from '../../shared/types';
import { GOG_CONFIG } from '../../shared/config';
import { resolveRipple } from '../../shared/ripple-state';
import { GogRippleDirective } from '../ripple/ripple.directive';

@Component({
  selector: 'gog-chip',
  imports: [GogRippleDirective, IconComponent],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class ChipComponent {
  readonly size = input<GogSize>('md');
  readonly shape = input<GogTagShape>('rounded');
  readonly disabled = input(false);
  readonly clickable = input(true);
  /**
   * Turns the chip into a filter chip: one you toggle on and off, rather than one you press.
   *
   * Three states, and `null` — the default — is the one that keeps every existing chip exactly
   * as it was: no `aria-pressed`, no selected look, and activating it only emits `gogClick`.
   * Set it to `false` and the chip becomes a toggle that is currently off; `true` and it is on,
   * which draws the ring and announces `aria-pressed="true"`. A chip with no `aria-pressed` at
   * all is not a toggle to a screen reader, which is why "off" has to be `false` rather than
   * absent.
   *
   * It is a `model`, so the chip flips it for you on click, Enter and Space — but only while it
   * is non-null. Bind it two-way and the row of filters needs no click handler:
   *
   * ```html
   * @for (f of filters(); track f.id) {
   *   <gog-chip [(selected)]="f.on">{{ f.label }}</gog-chip>
   * }
   * ```
   *
   * `gogClick` still fires, after the flip, so a handler reading `selected()` sees the new
   * value. If you drive the state yourself from that handler, bind one-way — toggling it there
   * as well would put it back where it started.
   */
  readonly selected = model<boolean | null>(null);
  readonly removable = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input('');
  readonly removeAriaLabel = input('Remove chip');
  readonly avatarUrl = input<string | null>(null);
  readonly avatarAlt = input('');
  readonly iconName = input<GogIconName | null>(null);
  /**
   * Press ripple. Unset, falls back to `GOG_CONFIG.ripple.enabled`, then to `false` — so
   * `[ripple]="false"` opts one instance out of an app that turned it on everywhere.
   */
  readonly ripple = input<boolean | undefined>(undefined);

  readonly gogClick = output<MouseEvent | KeyboardEvent>();
  readonly gogRemove = output<void>();

  protected readonly hostClasses = computed(() =>
    [
      'gog-chip',
      `gog-chip--${this.size()}`,
      `gog-chip--${this.shape()}`,
      this.removable() ? 'gog-chip--removable' : null,
      this.disabled() ? 'gog-chip--disabled' : 'gog-chip--interactive',
      this.clickable() ? 'gog-chip--clickable' : null,
      this.selected() === true ? 'gog-chip--selected' : null,
      this.avatarUrl() ? 'gog-chip--has-avatar' : null,
      this.iconName() ? 'gog-chip--has-icon' : null,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
  protected readonly isInteractive = computed(() => this.clickable() && !this.disabled());
  /**
   * `aria-pressed` needs the `role="button"` it qualifies, so it is written only on a chip that
   * has one. A selected chip that is disabled keeps its ring — the class does not depend on
   * this — because "on, and currently unavailable" is a real state and dropping the look would
   * leave it announced and invisible.
   */
  protected readonly ariaPressed = computed(() => {
    const selected = this.selected();
    if (selected === null || !this.isInteractive()) return null;
    return selected ? 'true' : 'false';
  });
  private readonly rippleConfigured = resolveRipple(this.ripple, inject(GOG_CONFIG));
  /**
   * A chip that is not interactive is a label, and a label answering a press with a wave is a
   * promise it cannot keep — so the ripple follows `isInteractive`, not just the input.
   */
  protected readonly rippleEnabled = computed(
    () => this.rippleConfigured() && this.isInteractive(),
  );

  protected onChipClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.toggleSelected();
    this.gogClick.emit(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.toggleSelected();
    this.gogClick.emit(event);
  }

  /** No-op unless `selected` is in play, so a chip that is not a filter is untouched. */
  private toggleSelected(): void {
    const selected = this.selected();
    if (selected === null) return;
    this.selected.set(!selected);
  }

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.gogRemove.emit();
  }
}
