import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

interface TocHeading {
  readonly id: string;
  readonly text: string;
}

const CONTENT_SELECTOR = '.content-container';
const HEADING_SELECTOR = 'h2[id]';
const RESCAN_DEBOUNCE_MS = 80;

@Component({
  selector: 'app-toc',
  templateUrl: './toc.html',
  styleUrl: './toc.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TocComponent {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private rescanTimeoutId: ReturnType<typeof setTimeout> | null = null;

  protected readonly headings = signal<readonly TocHeading[]>([]);
  protected readonly activeId = signal<string | null>(null);
  // `index.html` declares `<base href="/">`, which the browser also uses to
  // resolve bare fragment hrefs (`#id`) and relative `history` URLs — not just
  // anchor tags — so a plain `#id` link would jump to the root path instead of
  // staying on the current route. Building an absolute-path href sidesteps that.
  protected readonly currentPath = signal('');

  constructor() {
    // Routed page content (including async markdown fetches) lands inside
    // `.content-container` well after this component itself renders, and
    // route changes swap that content in place — a MutationObserver on the
    // container catches every case (first load, async content, navigation)
    // without needing to special-case any of them.
    afterNextRender(() => this.watchContent());

    this.destroyRef.onDestroy(() => {
      this.mutationObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      if (this.rescanTimeoutId !== null) clearTimeout(this.rescanTimeoutId);
    });
  }

  protected onLinkClick(event: MouseEvent, id: string): void {
    event.preventDefault();
    // `behavior: 'smooth'` never actually moves this scroller — confirmed by hand: neither
    // `scrollIntoView({behavior:'smooth'})` nor a direct `viewport.scrollTo({top, behavior:
    // 'smooth'})` budge `scrollTop` at all here, while `'instant'` works immediately. Likely
    // `.gog-scroll`'s own `contain: layout style` (see scroll.component.scss) interfering with
    // the browser's smooth-scroll engine — not something to fix from the consuming app, so this
    // jumps instead of animating.
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
    // Set directly rather than waiting for the IntersectionObserver to catch up: on a jump this
    // large, the observer only reports entries whose intersection state *changed* since the
    // last check, and a previously-active heading can report "no longer intersecting" (which
    // gets filtered out) without the newly-visible target ever registering in the same batch —
    // leaving the old heading marked active indefinitely. A click is unambiguous user intent,
    // so it wins immediately; natural scrolling after this still updates normally below.
    this.activeId.set(id);
  }

  private watchContent(): void {
    const content = document.querySelector(CONTENT_SELECTOR);
    if (!content) return;

    this.rescan();

    this.ngZone.runOutsideAngular(() => {
      this.mutationObserver = new MutationObserver(() => this.scheduleRescan());
      this.mutationObserver.observe(content, { childList: true, subtree: true });
    });
  }

  private scheduleRescan(): void {
    if (this.rescanTimeoutId !== null) clearTimeout(this.rescanTimeoutId);
    this.rescanTimeoutId = setTimeout(
      () => this.ngZone.run(() => this.rescan()),
      RESCAN_DEBOUNCE_MS,
    );
  }

  private rescan(): void {
    this.intersectionObserver?.disconnect();

    const content = document.querySelector(CONTENT_SELECTOR);
    const elements = content
      ? Array.from(content.querySelectorAll<HTMLElement>(HEADING_SELECTOR))
      : [];

    this.currentPath.set(`${window.location.pathname}${window.location.search}`);
    this.headings.set(elements.map((el) => ({ id: el.id, text: el.textContent ?? '' })));
    this.activeId.set(elements[0]?.id ?? null);

    if (!elements.length) return;

    // IntersectionObserver callbacks run outside Angular's zone by default.
    this.ngZone.runOutsideAngular(() => {
      // `.content-container` scrolls inside `<gog-scroll class="lab-main-scroll">` (app.html),
      // not the document, so `root` must be that scroller's actual viewport element — a bare
      // `root: null` would measure intersection against the browser viewport, which no longer
      // moves. `.gog-scroll__viewport` is the library's internal scrolling element (see
      // scroll.component.html); found by ancestor search rather than a component API because
      // ScrollComponent doesn't expose it publicly, matching the existing DOM-query approach
      // this class already uses for `.content-container` itself.
      const root = content?.closest<HTMLElement>('.gog-scroll__viewport') ?? null;

      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (!visible.length) return;

          const topMost = visible.reduce((closest, entry) =>
            entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest,
          );
          this.ngZone.run(() => this.activeId.set((topMost.target as HTMLElement).id));
        },
        { root, rootMargin: '0px 0px -70% 0px', threshold: 0 },
      );

      for (const el of elements) {
        this.intersectionObserver!.observe(el);
      }
    });
  }
}
