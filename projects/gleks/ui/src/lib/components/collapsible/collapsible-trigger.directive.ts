import { Directive, ElementRef, inject } from '@angular/core';

import { CollapsibleComponent } from './collapsible.component';

/**
 * Elements the browser already makes focusable and operable by keyboard. A `<button>` fires
 * `click` from Enter and Space on its own; an `<a href>` from Enter. Anything here is left
 * exactly as the consumer wrote it.
 */
const NATIVELY_OPERABLE = ['button', 'input', 'select', 'textarea', 'summary'];

/**
 * Marks the element that toggles a `gog-collapsible`. Works on any element — this wires the
 * click handler and the ARIA attributes pointing at the matching `gogCollapsibleContent`, and
 * owns no markup of its own.
 *
 * **On a non-focusable host it also supplies the button semantics**, because the alternative is
 * a control that announces itself and cannot be reached. A `<div gogCollapsibleTrigger>` used to
 * get `aria-expanded` and `aria-controls` — so a screen reader called it an interactive control —
 * with no tab stop and no key handling, which is precisely the combination that strands the
 * person relying on that announcement. On such a host the directive adds `role="button"`,
 * `tabindex="0"` and Enter/Space.
 *
 * It adds none of that to a `<button>` or an `<a href>`: those already have it, and a second
 * key handler would toggle twice per press. It also stands down if the consumer set `role` or
 * `tabindex` themselves — they have said what the element is, and overriding that is not the
 * directive's call.
 */
@Directive({
  selector: '[gogCollapsibleTrigger]',
  host: {
    class: 'gog-collapsible__trigger',
    '[class.gog-collapsible__trigger--open]': 'collapsible.open()',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.aria-controls]': 'collapsible.contentId()',
    '[attr.aria-disabled]': 'collapsible.disabled() ? "true" : null',
    '[attr.role]': 'needsButtonSemantics ? "button" : declaredRole',
    '[attr.tabindex]':
      'needsButtonSemantics ? (collapsible.disabled() ? -1 : 0) : declaredTabIndex',
    '(click)': 'collapsible.toggle()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class GogCollapsibleTriggerDirective {
  protected readonly collapsible = inject(CollapsibleComponent);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Whether this host needs the button role wired on. Read once: an element does not change
   * tag, and a consumer's own `role`/`tabindex` is part of how they declared it.
   */
  protected readonly needsButtonSemantics = this.resolveNeedsButtonSemantics();

  /*
   * Echoed back by the host bindings above when this directive stands down. A host binding that
   * evaluates to `null` *removes* the attribute, so binding `null` would have deleted the very
   * `role`/`tabindex` the consumer wrote — the opposite of standing down. Caught by the spec
   * that checks a consumer-declared `role` host survives.
   */
  protected readonly declaredRole = this.elementRef.nativeElement.getAttribute('role');
  protected readonly declaredTabIndex = this.elementRef.nativeElement.getAttribute('tabindex');

  protected onKeydown(event: KeyboardEvent): void {
    // A native button or link already turns these keys into a click; handling them again here
    // would open and close in the same press.
    if (!this.needsButtonSemantics) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    // Space scrolls the page by default, and Enter submits inside a form — neither is what the
    // press meant.
    event.preventDefault();
    this.collapsible.toggle();
  }

  private resolveNeedsButtonSemantics(): boolean {
    const el = this.elementRef.nativeElement;
    if (NATIVELY_OPERABLE.includes(el.tagName.toLowerCase())) return false;
    if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) return false;
    if (el.hasAttribute('role') || el.hasAttribute('tabindex')) return false;
    return true;
  }
}
