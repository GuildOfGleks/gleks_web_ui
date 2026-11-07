import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  model,
  booleanAttribute,
} from '@angular/core';

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
    '(pointerdown)': 'onPointerDown()',
  },
})
export class CollapsibleComponent {
  private static nextUid = 0;

  /** Two-way bindable open state: `[(open)]="signal"`. */
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Closes the panel once focus leaves both the trigger and the content — e.g. Tabbing past
   * the last focusable element inside, or a click landing somewhere else on the page. Off by
   * default: plenty of consumers (an FAQ list, a settings section someone reads top to bottom)
   * want the panel to stay open regardless of where focus goes next, so this is opt-in rather
   * than baked in.
   */
  readonly collapseOnFocusOut = input(false, { transform: booleanAttribute });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `gog-collapsible-${CollapsibleComponent.nextUid++}`;
  readonly contentId = computed(() => `${this.uid}-content`);

  /**
   * Set by a press inside, for the focus change that press causes. A press on the content's plain
   * text moves focus to `<body>` with no `relatedTarget` — the same focusout a press elsewhere on
   * the page gives — so the press itself is what tells the two apart.
   */
  private pressedInside = false;

  constructor() {
    // Once a press inside has put focus on <body>, a later press elsewhere causes no focusout at
    // all; so while open, a press outside closes directly.
    const document = inject(DOCUMENT);
    effect((onCleanup) => {
      if (!this.collapseOnFocusOut() || !this.open()) return;
      const onPress = (event: PointerEvent) => {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) this.open.set(false);
      };
      document.addEventListener('pointerdown', onPress, true);
      onCleanup(() => document.removeEventListener('pointerdown', onPress, true));
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((value) => !value);
  }

  protected onPointerDown(): void {
    this.pressedInside = true;
    // The focus change a press causes lands in the same task; anything later is not this press.
    setTimeout(() => (this.pressedInside = false));
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.collapseOnFocusOut() || !this.open() || this.pressedInside) return;

    // relatedTarget is the element gaining focus — null covers a click landing outside any
    // focusable element, or the window losing focus entirely; both count as "focus left" here.
    const next = event.relatedTarget as Node | null;
    if (next && this.elementRef.nativeElement.contains(next)) return;

    this.open.set(false);
  }
}
