import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input } from '@angular/core';

import { GogTooltipSide } from '../../shared/tooltip-position';

/**
 * The visible bubble, created on demand by `GogTooltipOverlay` and moved into `document.body`.
 * Not exported from `public-api.ts` — `[gogTooltip]` is the only public surface; this is an
 * implementation detail of how it renders, same relationship as `gog-select`'s panel template
 * to `GogDropdownOverlay`.
 */
@Component({
  selector: 'gog-tooltip-bubble',
  imports: [NgTemplateOutlet],
  templateUrl: './tooltip-bubble.component.html',
  styleUrl: './tooltip-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-tooltip',
    role: 'tooltip',
    '[attr.id]': 'bubbleId()',
    '[class.gog-tooltip--top]': "side() === 'top'",
    '[class.gog-tooltip--bottom]': "side() === 'bottom'",
    '[class.gog-tooltip--left]': "side() === 'left'",
    '[class.gog-tooltip--right]': "side() === 'right'",
    '[class.gog-tooltip--visible]': 'visible()',
    '[class]': 'extraClass()',
    '[style.top.px]': 'top()',
    '[style.left.px]': 'left()',
    '[style.z-index]': 'zIndex()',
  },
})
export class GogTooltipBubbleComponent {
  readonly bubbleId = input<string>('');
  readonly content = input<string | TemplateRef<unknown> | null>(null);
  readonly side = input<GogTooltipSide>('top');
  readonly top = input(0);
  readonly left = input(0);
  /** Toggled a frame after insertion so the enter transition has a 0 -> 1 opacity to run. */
  readonly visible = input(false);
  /**
   * Explicit stacking order resolved by the directive from the trigger's inherited
   * `--gog-tooltip-z` (see `resolveTooltipZIndex`), or null to leave it to the stylesheet's
   * `var(--gog-tooltip-z)`. Needed only because the bubble is moved to `document.body` and
   * so no longer inherits a `--gog-tooltip-z` a dialog panel raised on itself — same reason
   * `gog-select`'s appended panel resolves its own `z-index` instead of trusting the cascade.
   */
  readonly zIndex = input<number | null>(null);
  /**
   * Extra class(es) from the directive's `gogTooltipClass`, applied straight to the bubble.
   * The bubble sits in `document.body`, outside any scoped ancestor a consumer might set a
   * `--gog-tooltip-*` override on, so a class targeting the bubble directly is the only way
   * to restyle one specific tooltip instance — see `styling.instructions.md`'s "Panels
   * rendered outside the component subtree".
   */
  readonly extraClass = input('');

  protected readonly templateContent = computed(() => {
    const value = this.content();
    return value instanceof TemplateRef ? value : null;
  });
  protected readonly textContent = computed(() => {
    const value = this.content();
    return typeof value === 'string' ? value : '';
  });
}
