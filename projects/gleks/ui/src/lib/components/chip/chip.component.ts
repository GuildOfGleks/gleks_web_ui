import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GogSize, GogTagShape } from '../../shared/types';

@Component({
  selector: 'gog-chip',
  imports: [IconComponent],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]':
      '"gog-chip gog-chip--" + size() + " gog-chip--" + shape() + (removable() ? " gog-chip--removable" : "") + (disabled() ? " gog-chip--disabled" : " gog-chip--interactive") + (avatarUrl() ? " gog-chip--has-avatar" : "") + (iconName() ? " gog-chip--has-icon" : "")',
  },
})
export class ChipComponent {
  readonly size = input<GogSize>('md');
  readonly shape = input<GogTagShape>('rounded');
  readonly disabled = input(false);
  readonly removable = input(false);
  readonly ariaLabel = input('');
  readonly removeAriaLabel = input('Remove chip');
  readonly avatarUrl = input<string | null>(null);
  readonly avatarAlt = input('');
  readonly iconName = input<GogIconName | null>(null);

  readonly gogClick = output<MouseEvent | KeyboardEvent>();
  readonly gogRemove = output<void>();

  protected readonly isInteractive = computed(() => !this.disabled());

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
    if (this.disabled()) return;
    this.gogRemove.emit();
  }
}
