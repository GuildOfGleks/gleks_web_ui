import { Directive, inject } from '@angular/core';

import { CollapsibleComponent } from './collapsible.component';

/**
 * Marks the element that a `gog-collapsible` shows and hides. Applies the open/closed
 * CSS state and the ARIA wiring (`id`, `aria-hidden`, `inert`) to whatever element this is
 * placed on — that element owns its own content and layout.
 */
@Directive({
  selector: '[gogCollapsibleContent]',
  host: {
    class: 'gog-collapsible__content',
    '[class.gog-collapsible__content--open]': 'collapsible.open()',
    '[id]': 'collapsible.contentId()',
    '[attr.aria-hidden]': '!collapsible.open()',
    '[attr.inert]': '!collapsible.open() ? "" : null',
  },
})
export class GogCollapsibleContentDirective {
  protected readonly collapsible = inject(CollapsibleComponent);
}
