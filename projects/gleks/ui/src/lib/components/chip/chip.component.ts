import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

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
      this.avatarUrl() ? 'gog-chip--has-avatar' : null,
      this.iconName() ? 'gog-chip--has-icon' : null,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
  protected readonly isInteractive = computed(() => this.clickable() && !this.disabled());
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
    this.gogClick.emit(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.gogClick.emit(event);
  }

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.gogRemove.emit();
  }
}
