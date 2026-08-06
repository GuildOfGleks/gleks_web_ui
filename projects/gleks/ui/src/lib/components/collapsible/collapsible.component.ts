import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';

/**
 * Headless expand/collapse primitive — a trigger toggles a content region open and
 * closed, in place (no portal/overlay, unlike `gog-select`/`gog-multiselect`). Unopinionated
 * about markup: project any element as the trigger via `gogCollapsibleTrigger` and any
 * element as the content via `gogCollapsibleContent`; this component only holds the shared
 * `open` state and generates the id pair linking them for ARIA.
 */
@Component({
  selector: 'gog-collapsible',
  template: `<ng-content />`,
  styleUrl: './collapsible.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-collapsible-host',
    '[class.gog-collapsible-host--disabled]': 'disabled()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class CollapsibleComponent {
  private static nextUid = 0;

  /** Two-way bindable open state: `[(open)]="signal"`. */
  readonly open = model(false);
  readonly disabled = input(false);
  /**
   * Closes the panel once focus leaves both the trigger and the content — e.g. Tabbing past
   * the last focusable element inside, or a click landing somewhere else on the page. Off by
   * default: plenty of consumers (an FAQ list, a settings section someone reads top to bottom)
   * want the panel to stay open regardless of where focus goes next, so this is opt-in rather
   * than baked in.
   */
  readonly collapseOnFocusOut = input(false);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `gog-collapsible-${CollapsibleComponent.nextUid++}`;
  readonly contentId = computed(() => `${this.uid}-content`);

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((value) => !value);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.collapseOnFocusOut() || !this.open()) return;

    // relatedTarget is the element gaining focus — null covers a click landing outside any
    // focusable element, or the window losing focus entirely; both count as "focus left" here.
    const next = event.relatedTarget as Node | null;
    if (next && this.elementRef.nativeElement.contains(next)) return;

    this.open.set(false);
  }
}
