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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
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
    this.rescanTimeoutId = setTimeout(() => this.ngZone.run(() => this.rescan()), RESCAN_DEBOUNCE_MS);
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
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (!visible.length) return;

          const topMost = visible.reduce((closest, entry) =>
            entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest,
          );
          this.ngZone.run(() => this.activeId.set((topMost.target as HTMLElement).id));
        },
        { rootMargin: '0px 0px -70% 0px', threshold: 0 },
      );

      for (const el of elements) {
        this.intersectionObserver!.observe(el);
      }
    });
  }
}
