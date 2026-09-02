import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import {
  ButtonComponent,
  DialogComponent,
  ScrollComponent,
  ThemeService,
  ToastContainerComponent,
} from '@guildofgleks/ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faPalette, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { SidebarLeftComponent } from './components/shared/sidebar-left/sidebar-left';
import { TocComponent } from './components/shared/toc/toc';
import { LIBRARY_VERSION } from './components/shared/library-version';
import { SeoService } from './components/shared/seo';

interface ThemeMenuOption {
  value: string;
  label: string;
}

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
    RouterLink,
    FaIconComponent,
    ButtonComponent,
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
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
    '[class.lab--nav-open]': 'isNavOpen()',
  },
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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
  protected readonly libraryVersion = LIBRARY_VERSION;

  protected readonly footerLinks = FOOTER_LINKS;

  // `light` and `dark` are built into `theme.css`; the other nine are the package's presets,
  // imported in `angular.json` (see the Theming page for the catalogue). None of them is
  // declared by this site — including `material` and `primeng`, which used to be hand-authored
  // look-alikes in `styles.scss` and became real presets in 21.7.0. Listed in the same order
  // the README's catalogue table uses, so the two documents agree.
  protected readonly themeOptions: ThemeMenuOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'slate', label: 'Slate' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'one-light', label: 'One Light' },
    { value: 'material', label: 'Material' },
    { value: 'primeng', label: 'PrimeNG' },
    { value: 'ledger', label: 'Ledger' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'bevel', label: 'Bevel' },
    { value: 'parchment', label: 'Parchment' },
  ];

  protected readonly activeTheme = computed(() => this.themeService.theme());
  protected readonly isThemeMenuOpen = signal(false);

  // Scoped to `.content-container` (app.html), not `<html>`: the library's components mirror
  // through logical CSS properties, but this site's own chrome (header, both sidebars) is
  // written in physical left/right (see app.scss) and was never part of the RTL story — the
  // Right-to-left doc page's own demo makes the same choice, on a smaller region. Flipping the
  // whole document would break the chrome around the page rather than demonstrate the library.
  protected readonly isRtl = signal(false);

  /**
   * The left sidebar as a drawer, below the layout's tablet breakpoint. Above it the sidebar is
   * a permanent column and this is ignored — the same markup, positioned differently, so the
   * navigation is never a second component that can drift from the real one.
   */
  protected readonly isNavOpen = signal(false);

  protected readonly faBars = faBars;
  protected readonly faPalette = faPalette;
  protected readonly faRightLeft = faRightLeft;

  protected toggleNav(): void {
    this.isNavOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.isNavOpen.set(false);
  }

  protected toggleThemeMenu(): void {
    this.isThemeMenuOpen.update((open) => !open);
  }

  protected closeThemeMenu(): void {
    this.isThemeMenuOpen.set(false);
  }

  protected selectTheme(theme: string): void {
    this.themeService.setTheme(theme);
    this.closeThemeMenu();
  }

  protected toggleDirection(): void {
    this.isRtl.update((rtl) => !rtl);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isThemeMenuOpen()) return;

    const switcher = this.elRef.nativeElement.querySelector('.theme-switcher');
    if (switcher && !switcher.contains(event.target as Node)) {
      this.closeThemeMenu();
    }
  }

  /** Escape closes whichever overlay is open — the theme menu first, then the nav drawer. */
  protected onEscape(): void {
    if (this.isThemeMenuOpen()) {
      this.closeThemeMenu();
      return;
    }
    this.closeNav();
  }
}
