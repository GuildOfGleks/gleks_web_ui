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
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project an `<ng-template gogTagIcon>` into the component instead. Removed in 21.5.0.
   */
  readonly iconTemplate = input<TemplateRef<unknown> | null>(null);
  /** Projected `gogTagIcon` template; wins over the deprecated `iconTemplate` input. */
  protected readonly iconSlot = contentChild(GogTagIconDirective);
  readonly fullWidth = input(false);

  protected readonly hasIcon = computed(
    () => !!this.iconSlot() || this.iconTemplate() !== null || this.iconName() !== null,
  );

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
