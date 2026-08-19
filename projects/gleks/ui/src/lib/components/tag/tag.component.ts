import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GogSize, GogTagVariant } from '../../shared/types';
import { GogTagShape } from '../../shared/types';

/**
 * Custom markup for the tag's leading icon:
 *
 * ```html
 * <ng-template gogTagIcon><my-icon /></ng-template>
 * ```
 */
@Directive({ selector: '[gogTagIcon]' })
export class GogTagIconDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

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
  /** Projected `gogTagIcon` template, shown in place of `iconName`. */
  protected readonly iconSlot = contentChild(GogTagIconDirective);
  readonly fullWidth = input(false);

  protected readonly hasIcon = computed(() => !!this.iconSlot() || this.iconName() !== null);

  protected readonly hostClasses = computed(() =>
    [
      'gog-tag',
      `gog-tag--${this.variant()}`,
      `gog-tag--${this.size()}`,
      `gog-tag--${this.shape()}`,
      this.hasIcon() ? 'gog-tag--has-icon' : null,
      this.fullWidth() ? 'gog-host--full-width' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
}
