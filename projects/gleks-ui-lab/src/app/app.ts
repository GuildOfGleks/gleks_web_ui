import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { DialogComponent, ScrollComponent, ToastContainerComponent } from '@guildofgleks/ui';
import { AppHeader } from './components/shared/app-header/app-header';
import { DirectionPreference } from './components/shared/direction-preference';
import { SidebarLeftComponent } from './components/shared/sidebar-left/sidebar-left';
import { TocComponent } from './components/shared/toc/toc';
import { SeoService } from './components/shared/seo';

interface FooterLink {
  readonly label: string;
  readonly href: string;
}

// Every one of these leaves the site, so they all open in a new tab (see app.html). The old
// `Documentation` entry pointed at `https://your-domain.com` — a placeholder that shipped, and
// the reason this list is now declared rather than written inline.
const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/GuildOfGleks/gleks_web_ui' },
  { label: 'Report an issue', href: 'https://github.com/GuildOfGleks/gleks_web_ui/issues/new' },
  { label: 'NPM Package', href: 'https://www.npmjs.com/package/@guildofgleks/ui' },
  // The Patreon handle comes from `.github/FUNDING.yml`, which is the same one GitHub's
  // Sponsor button uses — keep the two in step if it ever changes.
  { label: 'Support on Patreon', href: 'https://www.patreon.com/chebureck77' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppHeader,
    ScrollComponent,
    SidebarLeftComponent,
    TocComponent,
    DialogComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '[class.lab--nav-open]': 'isNavOpen()',
  },
})
export class App {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Set on `.content-container`, not on `<html>` — see the service for why. */
  protected readonly isRtl = inject(DirectionPreference).isRtl;

  private readonly header = viewChild.required(AppHeader);

  protected readonly footerLinks = FOOTER_LINKS;

  // The page does not scroll — `.lab-layout` is pinned to 100dvh and this `gog-scroll` owns the
  // content's scroll position (app.scss). Angular's own `withInMemoryScrolling` only ever moves
  // the *document*, so it cannot help here; the scroller has to be reset by hand.
  private readonly mainScroll = viewChild<ScrollComponent>('mainScroll');

  constructor() {
    // Per-page title, description, canonical and social tags. Started here because nothing else
    // injects it, and it must run on the server too — see the service's own header.
    inject(SeoService).init();

    // Without this, switching from halfway down one component page to another lands the reader
    // mid-page on content they have not seen — the scroller keeps its offset because the routed
    // component is swapped inside it rather than around it.
    //
    // `NavigationEnd` only, so a failed or cancelled navigation leaves the position alone, and
    // 'instant' rather than the default 'smooth': a route change is a jump, and this scroller
    // ignores smooth behaviour anyway (see toc.ts's note — `contain: layout style` on
    // `.gog-scroll` stops the browser's smooth-scroll engine from moving it at all).
    //
    // The TOC's in-page links are not affected: they scroll by `scrollIntoView` + `replaceState`,
    // which is not a router navigation, so nothing here fires for them.
    if (this.isBrowser) {
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          takeUntilDestroyed(),
        )
        .subscribe(() => {
          this.mainScroll()?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          // Picking a page is the whole reason the drawer was opened, so it closes itself —
          // otherwise a phone reader lands on the new page with the nav still covering it.
          this.isNavOpen.set(false);
        });
    }
  }

  // Read from the installed package rather than written here, so the badge cannot claim a
  // version the site was not actually built against. See `library-version.ts`.
  /**
   * The left sidebar as a drawer, below the layout's tablet breakpoint. Above it the sidebar is
   * a permanent column and this is ignored — the same markup, positioned differently, so the
   * navigation is never a second component that can drift from the real one.
   */
  protected readonly isNavOpen = signal(false);

  protected toggleNav(): void {
    this.isNavOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.isNavOpen.set(false);
  }

  /**
   * Escape closes whichever overlay is open — the header's two first, then the nav drawer.
   *
   * The order lives here rather than being split across the two components: the header cannot
   * know about the drawer, and a second listener inside it would close its own panel *and* let
   * this one close the drawer on the same key.
   */
  protected onEscape(): void {
    if (this.header().closeOverlays()) return;
    this.closeNav();
  }
}
