import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { GogBadgePosition, GogTagVariant, nextGogControlId } from '@guildofgleks/ui/shared';

/** Beyond this count the badge renders `N+` rather than growing without limit. */
const DEFAULT_MAX = 99;

/** What can take focus, and so carries the name a screen reader says on Tab. */
const FOCUSABLE =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * A count or status dot pinned to the corner of another element.
 *
 * ```html
 * <gog-button gogBadge="12" badgeAriaLabel="12 unread">Inbox</gog-button>
 * <gog-icon name="info" gogBadge badgeDot />
 * ```
 *
 * A **directive, not a component**, because a badge decorates something that already exists —
 * a button, an icon, an avatar. As a component it would have to wrap its host, which changes
 * that host's layout, and it would duplicate `gog-tag` for the sake of one different radius.
 *
 * It renders **nothing at all** when the value is `0`, `null` or empty and `badgeDot` is off:
 * a badge reading "0" is the defining bug of this component class, so it is not reachable.
 */
@Directive({
  selector: '[gogBadge]',
  host: {
    // The badge is absolutely positioned against the host, so the host has to be a containing
    // block. A class rather than an inline style so a consumer can still position it themselves.
    class: 'gog-badge-host',
  },
})
export class GogBadgeDirective {
  /** The badge content. Numbers above `badgeMax` render as `N+`. */
  readonly gogBadge = input<string | number | null>(null);
  readonly badgePosition = input<GogBadgePosition>('top-end');
  /** Reuses the library's semantic colour set — the same four names `gog-tag` takes. */
  readonly badgeVariant = input<GogTagVariant>('danger');
  /** Renders a bare dot with no text: "something changed here", with no count to give. */
  readonly badgeDot = input(false, { transform: booleanAttribute });
  readonly badgeMax = input(DEFAULT_MAX);
  /** Keeps the badge out of the DOM without removing the directive. */
  readonly badgeHidden = input(false, { transform: booleanAttribute });
  /**
   * What assistive tech should hear instead of the bare number.
   *
   * Left empty, the badge text is announced with the host, which reads as "Inbox 12". Set this
   * and the visible badge becomes `aria-hidden` while this wording is announced in its place,
   * so the host reads as "Inbox, 12 unread" instead.
   *
   * When the host is focusable itself (`<button gogBadge>`, `a[gogButton]`) the wording is part
   * of its name. When the focusable element is *inside* the host — `gog-button` renders its own
   * `<button>` — text appended to the host would sit beside that button rather than in it, and
   * Tab would announce "Inbox, button" with no count; so there the badge describes the inner
   * element through `aria-describedby` instead.
   */
  readonly badgeAriaLabel = input('');

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private badgeEl: HTMLElement | null = null;
  private descriptionEl: HTMLElement | null = null;
  /** The focusable element inside the host that `descriptionEl` describes, when there is one. */
  private describedEl: HTMLElement | null = null;
  private readonly descriptionId = nextGogControlId('gog-badge-description');

  /** `0` and `''` count as "nothing to show" — see the class comment. */
  private readonly hasContent = computed(() => {
    const value = this.gogBadge();
    if (value === null || value === undefined) return false;
    const text = String(value).trim();
    return text !== '' && text !== '0';
  });

  protected readonly visible = computed(
    () => !this.badgeHidden() && (this.badgeDot() || this.hasContent()),
  );

  protected readonly text = computed(() => {
    if (this.badgeDot()) return '';

    const value = this.gogBadge();
    const numeric = typeof value === 'number' ? value : Number(value);
    // Non-numeric content ("NEW", "beta") passes through untouched — capping only makes sense
    // for a count.
    if (value === null || Number.isNaN(numeric) || String(value).trim() === '') {
      return value === null ? '' : String(value);
    }

    const max = this.badgeMax();
    return numeric > max ? `${max}+` : String(value);
  });

  private readonly classNames = computed(() =>
    [
      'gog-badge',
      `gog-badge--${this.badgePosition()}`,
      `gog-badge--${this.badgeVariant()}`,
      this.badgeDot() ? 'gog-badge--dot' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardown());

    effect(() => {
      // Browser-only on purpose. The badge is a node the server would render but the client's
      // hydration walk knows nothing about, which is an NG0500 node mismatch waiting to happen.
      // It costs one frame after hydration and buys a component that is safe in an SSR app.
      if (!this.isBrowser) return;

      if (!this.visible()) {
        this.teardown();
        return;
      }

      this.render(this.classNames(), this.text(), this.badgeAriaLabel());
    });
  }

  private render(className: string, text: string, ariaLabel: string): void {
    const host = this.hostRef.nativeElement;

    this.badgeEl ??= this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(this.badgeEl, 'class', className);
    this.renderer.setProperty(this.badgeEl, 'textContent', text);

    const inner = this.innerFocusable();
    const spoken = ariaLabel || text;

    if (inner && spoken) {
      // Both copies in the host are hidden from reading, so nothing is said twice; a hidden
      // node still counts when an aria-describedby points at it directly.
      this.renderer.setAttribute(this.badgeEl, 'aria-hidden', 'true');
      const description = this.renderDescription(host, spoken);
      this.renderer.setAttribute(description, 'aria-hidden', 'true');
      this.describe(inner);
    } else if (ariaLabel) {
      // The wording replaces the number rather than joining it, so nothing is said twice.
      this.renderer.setAttribute(this.badgeEl, 'aria-hidden', 'true');
      const description = this.renderDescription(host, ariaLabel);
      this.renderer.removeAttribute(description, 'aria-hidden');
      this.undescribe();
    } else {
      this.renderer.removeAttribute(this.badgeEl, 'aria-hidden');
      this.removeDescription();
    }

    if (!this.badgeEl.parentNode) {
      this.renderer.appendChild(host, this.badgeEl);
    }
  }

  /** The focusable element inside a host that is not focusable itself, e.g. `gog-button`'s. */
  private innerFocusable(): HTMLElement | null {
    const host = this.hostRef.nativeElement as HTMLElement;
    if (host.matches(FOCUSABLE)) return null;
    return host.querySelector<HTMLElement>(FOCUSABLE);
  }

  private renderDescription(host: HTMLElement, wording: string): HTMLElement {
    const description = (this.descriptionEl ??= this.renderer.createElement('span') as HTMLElement);
    this.renderer.setAttribute(description, 'class', 'gog-visually-hidden');
    this.renderer.setAttribute(description, 'id', this.descriptionId);
    this.renderer.setProperty(description, 'textContent', wording);
    if (!description.parentNode) {
      this.renderer.appendChild(host, description);
    }
    return description;
  }

  /** Adds the description's id to `aria-describedby`, keeping whatever the element had. */
  private describe(element: HTMLElement): void {
    if (this.describedEl && this.describedEl !== element) this.undescribe();
    const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(this.descriptionId)) {
      this.renderer.setAttribute(
        element,
        'aria-describedby',
        [...ids, this.descriptionId].join(' '),
      );
    }
    this.describedEl = element;
  }

  private undescribe(): void {
    const element = this.describedEl;
    this.describedEl = null;
    if (!element) return;
    const ids = (element.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && id !== this.descriptionId);
    if (ids.length) {
      this.renderer.setAttribute(element, 'aria-describedby', ids.join(' '));
    } else {
      this.renderer.removeAttribute(element, 'aria-describedby');
    }
  }

  private removeDescription(): void {
    this.undescribe();
    if (this.descriptionEl?.parentNode) {
      this.renderer.removeChild(this.hostRef.nativeElement, this.descriptionEl);
    }
    this.descriptionEl = null;
  }

  private teardown(): void {
    if (this.badgeEl?.parentNode) {
      this.renderer.removeChild(this.hostRef.nativeElement, this.badgeEl);
    }
    this.badgeEl = null;
    this.removeDescription();
  }
}
