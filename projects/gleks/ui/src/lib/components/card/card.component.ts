import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
} from '@angular/core';

import { nextGogControlId } from '../../shared/control-id';
import { GogSize, GogSurfaceVariant } from '../../shared/types';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/** Placeholder lines rendered under the title bar while `loading` is on. */
const DEFAULT_SKELETON_LINES = 2;

/**
 * The card's heading. Put it on the consumer's own `<h2>`…`<h6>` — the heading level belongs to
 * the page, not to the component — and the card names itself with it: it takes the element's id
 * (generating one when it has none) and points its own `aria-labelledby` at it.
 */
@Directive({
  selector: '[gogCardHeader]',
  host: { class: 'gog-card__header' },
})
export class GogCardHeaderDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The id the card labels itself with. A consumer-supplied `id` is kept as-is. */
  readonly headerId: string;

  constructor() {
    const host = this.element.nativeElement;
    if (!host.id) {
      host.id = nextGogControlId('gog-card-header');
    }
    this.headerId = host.id;
  }
}

/**
 * Full-bleed media — an `<img>`, `<video>` or `<picture>` that runs to the card's edges rather
 * than sitting inside its padding. Place it first inside the card to get the rounded top.
 */
@Directive({
  selector: '[gogCardMedia]',
  host: { class: 'gog-card__media' },
})
export class GogCardMediaDirective {}

/** The card's footer row — actions, a summary line. Separated from the body by a rule. */
@Directive({
  selector: '[gogCardFooter]',
  host: { class: 'gog-card__footer' },
})
export class GogCardFooterDirective {}

/**
 * A surface for one self-contained thing: a product tile, a summary, a search result.
 *
 * It paints a background, a border and a radius — which a CSS class could also do — and then
 * three things a class cannot:
 *
 * 1. **It names itself.** A `gogCardHeader` heading becomes the card's accessible name via
 *    `aria-labelledby`, and the card announces itself as a group, so the boundary between one
 *    card and the next exists for a screen reader too. (`role="group"`, not `region`: a grid of
 *    twenty cards would put twenty landmarks in the landmark list, which is worse than none.)
 * 2. **It makes the whole surface clickable without inventing a control.** See `gogCardLink`.
 * 3. **It folds in `loading` and `disabled`**, including `aria-busy` and taking the card's own
 *    link out of the tab order — the wiring every consumer would otherwise repeat per card.
 */
@Component({
  selector: 'gog-card',
  imports: [SkeletonComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    // A card with a heading is a named group; one without has nothing to be named by, and an
    // unnamed group is noise in the accessibility tree rather than structure.
    '[attr.role]': 'labelledBy() ? "group" : null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class CardComponent {
  readonly variant = input<GogSurfaceVariant>('outlined');
  readonly size = input<GogSize>('md');
  /** Dims the card and takes its `gogCardLink` out of the tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Replaces the card's content with placeholder bars shaped like a title and a few lines of
   * text, and marks the host `aria-busy`. For a *refresh* of a card that already has content —
   * where the shape is already on screen and should stay — project a `gog-spinner-overlay`
   * instead; this treatment is the first-paint one.
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Text lines under the title bar while `loading` is on. */
  readonly skeletonLines = input(DEFAULT_SKELETON_LINES);

  protected readonly header = contentChild(GogCardHeaderDirective);
  private readonly link = contentChild(GogCardLinkDirective, { descendants: true });

  protected readonly labelledBy = computed(() => this.header()?.headerId ?? null);
  /** A card is interactive because something in it is a real link or button, never by input. */
  protected readonly interactive = computed(() => this.link() !== undefined);
  /** Disabled or loading: the surface is still readable, but nothing in it can be activated. */
  private readonly inert = computed(() => this.disabled() || this.loading());

  protected readonly hostClasses = computed(() =>
    [
      'gog-card',
      `gog-card--${this.variant()}`,
      `gog-card--${this.size()}`,
      this.interactive() ? 'gog-card--interactive' : null,
      this.disabled() ? 'gog-card--disabled' : null,
      this.loading() ? 'gog-card--loading' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  constructor() {
    /*
     * The link is the *consumer's* `<a>`/`<button>`, so `disabled` has to reach it from here.
     * `pointer-events: none` (surfaces.css) stops the pointer; only removing the tab stop stops
     * the keyboard, and there is no attribute binding to put on an element this component does
     * not render. A tabindex the consumer set themselves is put back rather than deleted.
     */
    let restoreTabIndex: string | null = null;
    effect(() => {
      const host = this.link()?.elementRef.nativeElement;
      if (!host) return;

      if (this.inert()) {
        restoreTabIndex = host.getAttribute('tabindex');
        host.setAttribute('tabindex', '-1');
        host.setAttribute('aria-disabled', 'true');
        return;
      }

      host.removeAttribute('aria-disabled');
      if (restoreTabIndex === null) {
        host.removeAttribute('tabindex');
      } else {
        host.setAttribute('tabindex', restoreTabIndex);
      }
    });
  }
}

/**
 * Makes the whole card activate this link — put it on the `<a>` (or `<button>`) the card is
 * *about*, usually the one inside its heading:
 *
 * ```html
 * <gog-card>
 *   <h3 gogCardHeader><a gogCardLink routerLink="/people/ada">Ada Lovelace</a></h3>
 *   <p>Mathematician, 1815–1852.</p>
 * </gog-card>
 * ```
 *
 * ## Why this, and not an `interactive` input
 *
 * The obvious API — `<gog-card interactive (gogClick)>` — has the component render a `<button>`
 * or an `<a>` of its own, and that goes wrong in three ways this does not:
 *
 * - **Nothing else in the card could be interactive.** A `<button>` may not contain a button or
 *   a link, so a card with actions in its footer would be invalid markup with a broken tab order.
 * - **It could not navigate the way an app navigates.** `routerLink` lives on the consumer's
 *   element; a card rendering its own `<a>` would have to broker the router's whole input
 *   surface, which is exactly why `[gogButton]` is a directive rather than a link mode on
 *   `gog-button`.
 * - **The accessible name would be the card's entire text**, because that is what a button
 *   wrapping everything announces.
 *
 * Here the link stays a real link — its href, its keyboard behaviour, its middle-click, its
 * "open in new tab" — and only its *hit area* is stretched over the card, with the card's focus
 * ring drawn around the surface when it is focused. Anything else focusable inside an
 * interactive card sits above that hit area automatically (see `surfaces.css`).
 *
 * The two costs of the pattern, both inherent to it: text inside the card cannot be selected by
 * dragging across it, and a second link in the card is reached by keyboard but not by clicking
 * the surface around it.
 */
@Directive({
  // Restricted to the two elements that are already a control, for the same reason
  // `[gogButton]` is: on a `<div>` this would look clickable and be invisible to the keyboard.
  selector: 'a[gogCardLink], button[gogCardLink]',
  host: { class: 'gog-card__link' },
})
export class GogCardLinkDirective {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}
