import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

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
  },
})
export class CollapsibleComponent {
  private static nextUid = 0;

  /** Two-way bindable open state: `[(open)]="signal"`. */
  readonly open = model(false);
  readonly disabled = input(false);

  private readonly uid = `gog-collapsible-${CollapsibleComponent.nextUid++}`;
  readonly contentId = computed(() => `${this.uid}-content`);

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((value) => !value);
  }
}
