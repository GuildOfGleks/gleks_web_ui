import { Directive, inject } from '@angular/core';

import { CollapsibleComponent } from './collapsible.component';

/**
 * Marks the element that toggles a `gog-collapsible`. Works on any clickable element
 * (`<button>`, `<a>`, ...) — this only wires the click handler and the ARIA attributes
 * pointing at the matching `gogCollapsibleContent`; it owns no markup of its own.
 */
@Directive({
  selector: '[gogCollapsibleTrigger]',
  host: {
    class: 'gog-collapsible__trigger',
    '[class.gog-collapsible__trigger--open]': 'collapsible.open()',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.aria-controls]': 'collapsible.contentId()',
    '[attr.aria-disabled]': 'collapsible.disabled() ? "true" : null',
    '(click)': 'collapsible.toggle()',
  },
})
export class GogCollapsibleTriggerDirective {
  protected readonly collapsible = inject(CollapsibleComponent);
}
