import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GogDividerVariant, GogOrientation } from '../../shared/types';

/**
 * A rule separating two regions, optionally with a label running through it.
 *
 * ```html
 * <gog-divider />
 * <gog-divider orientation="vertical" />
 * <gog-divider>OR</gog-divider>
 * ```
 *
 * The label is projected content rather than a `label` input: it is markup, so a consumer can
 * put an icon or a `<gog-tag>` in it without the component growing an input per case. There is
 * no `hasLabel` input either — the stylesheet keys off whether anything was actually projected,
 * so the two forms above are the whole API.
 */
@Component({
  selector: 'gog-divider',
  imports: [],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class DividerComponent {
  readonly orientation = input<GogOrientation>('horizontal');
  readonly variant = input<GogDividerVariant>('solid');
  /**
   * Indents the rule from the leading edge so it lines up with the *text* of a list whose rows
   * start with an icon or avatar, instead of cutting across the whole row.
   */
  readonly inset = input(false);

  protected readonly hostClasses = computed(() =>
    [
      'gog-divider',
      `gog-divider--${this.orientation()}`,
      `gog-divider--${this.variant()}`,
      this.inset() ? 'gog-divider--inset' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
}
