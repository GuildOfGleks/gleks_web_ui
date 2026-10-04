import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent, type GogIconName } from '../icon/icon.component';
import { GogSize } from '@guildofgleks/ui/shared';

/** An illustration in place of the icon — an `<img>`, an `<svg>`. Decorative; say it in words. */
@Directive({
  selector: '[gogEmptyStateMedia]',
  host: { class: 'gog-empty-state__media', 'aria-hidden': 'true' },
})
export class GogEmptyStateMediaDirective {}

/** The row of actions under the description — what the reader can do about it being empty. */
@Directive({
  selector: '[gogEmptyStateActions]',
  host: { class: 'gog-empty-state__actions' },
})
export class GogEmptyStateActionsDirective {}

/** A heading level for the title, or `null` for styled text that is not in the outline. */
export type GogEmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * What a region says when it has nothing to show. `docs/empty-state.md` has the argument for why
 * it is a component; the short version is that the empty states that matter are *answers* — a
 * search that matched nothing, the last item deleted — and a screen reader hears none of them.
 *
 * **How it announces.** The same mechanism as `gog-alert`: an element inserted together with its
 * own text is not announced, so a visually hidden polite region, empty on the first render, takes a
 * copy of the message one render later. Unlike an alert it then *keeps* copying: an empty state
 * stays mounted while the query that produced it changes, and each new "No results for …" is said.
 * Only the heading and the description are copied, never the actions.
 *
 * `live="off"` is for an empty state a page loads with, where announcing it adds nothing.
 */
@Component({
  selector: 'gog-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class EmptyStateComponent {
  readonly heading = input('');
  /**
   * Unset, the title is styled text. A number makes it a real heading at that level — set it when
   * the empty state is the content of a page or section, at the level the headings around it set.
   */
  readonly headingLevel = input<GogEmptyStateHeadingLevel | null>(null);
  /** Drawn above the title, decorative. A projected `gogEmptyStateMedia` replaces it. */
  readonly iconName = input<GogIconName | null>(null);
  /** `'off'` for an empty state the page loads with; `'polite'` for one that answers something. */
  readonly live = input<'polite' | 'off'>('polite');
  readonly size = input<GogSize>('md');

  private readonly message = viewChild.required<ElementRef<HTMLElement>>('message');
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Empty until after the first render, which is the whole mechanism: the region exists, then the
   * text arrives inside it.
   */
  protected readonly announcement = signal('');

  protected readonly hostClasses = computed(
    () => `gog-empty-state gog-empty-state--${this.size()}`,
  );

  constructor() {
    afterNextRender(() => {
      const element = this.message().nativeElement;
      const copy = () => {
        if (this.live() === 'off') return this.announcement.set('');
        this.announcement.set(element.textContent?.replace(/\s+/g, ' ').trim() ?? '');
      };
      copy();
      // The empty state outlives the query that produced it; say each new answer.
      const observer = new MutationObserver(copy);
      observer.observe(element, { childList: true, subtree: true, characterData: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
