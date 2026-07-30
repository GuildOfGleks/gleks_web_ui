import { TemplateRef, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GogSize, GogTagVariant } from '../../shared/types';
import { GogTagShape } from '../../shared/types';

@Component({
  selector: 'gog-tag',
  imports: [IconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class TagComponent {
  readonly variant = input<GogTagVariant>('info');
  readonly size = input<GogSize>('md');
  readonly shape = input<GogTagShape>('rounded');
  readonly iconName = input<GogIconName | null>(null);
  readonly iconTemplate = input<TemplateRef<unknown> | null>(null);

  protected readonly hasIcon = computed(() => this.iconTemplate() !== null || this.iconName() !== null);

  protected readonly hostClasses = computed(() =>
    [
      'gog-tag',
      `gog-tag--${this.variant()}`,
      `gog-tag--${this.size()}`,
      `gog-tag--${this.shape()}`,
      this.hasIcon() ? 'gog-tag--has-icon' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
}
