import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { type GogIconName, IconComponent } from '../icon/icon.component';
import { GogSize, GogTagShape } from '../../shared/types';

@Component({
  selector: 'gog-chip',
  imports: [IconComponent],
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
