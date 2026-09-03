import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
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
  GogTooltipDirective,
  ScrollComponent,
  ThemeService,
  ToastContainerComponent,
} from '@guildofgleks/ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faAlignLeft,
  faAlignRight,
  faBars,
  faDroplet,
  faDropletSlash,
  faMagnifyingGlass,
  faPalette,
} from '@fortawesome/free-solid-svg-icons';
import { RipplePreference } from './components/shared/ripple-preference';
import { SidebarLeftComponent } from './components/shared/sidebar-left/sidebar-left';
import { TocComponent } from './components/shared/toc/toc';
import { LIBRARY_VERSION } from './components/shared/library-version';
import { SeoService } from './components/shared/seo';
import { SearchEntry, searchNav } from './components/shared/search-index';

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
    GogTooltipDirective,
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
  private readonly ripplePreference = inject(RipplePreference);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
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

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly isSearchOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly searchResults = computed<readonly SearchEntry[]>(() =>
    searchNav(this.searchQuery()),
  );
  protected readonly activeResultIndex = signal(-1);

  /**
   * The active option's element id, for the input's `aria-activedescendant` — the whole reason
   * arrow-key movement through the results is perceivable at all. Focus never leaves the input
   * in an ARIA combobox, so without this a screen-reader user pressing ArrowDown hears nothing
   * change no matter how the list is highlighted. `null` (attribute absent) while nothing is
   * selected, which is the state Enter reads as "take the top result".
   */
  protected readonly activeResultId = computed(() => {
    const index = this.activeResultIndex();
    return index >= 0 ? `nav-search-result-${index}` : null;
  });

  /**
   * The search toggle's `aria-controls`, and `null` while the panel is closed. The panel lives
   * inside an `@if`, so a constant id would point at an element that is not in the document
   * whenever the search is shut — an invalid reference that sends a screen-reader user looking
   * for a region that does not exist.
   *
   * Both header toggles state themselves through `gog-button`'s `ariaPressed`/`ariaExpanded`/
   * `ariaControls` inputs (21.8.0). Before those existed each one carried its state in its
   * accessible *name* instead, because an `[attr.aria-*]` binding on `<gog-button>` lands on the
   * roleless custom-element host and never reaches the `<button>` inside. The name is stable
   * again now; a name that changed under the user was the compromise, not the goal. Do not
   * "restore" a host attribute binding here — it would silently do nothing.
   */
  protected readonly searchPanelId = computed(() =>
    this.isSearchOpen() ? 'nav-search-panel' : null,
  );

  /**
   * The left sidebar as a drawer, below the layout's tablet breakpoint. Above it the sidebar is
   * a permanent column and this is ignored — the same markup, positioned differently, so the
   * navigation is never a second component that can drift from the real one.
   */
  protected readonly isNavOpen = signal(false);

  protected readonly faBars = faBars;
  protected readonly faPalette = faPalette;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;

  /**
   * Whether the site is running with the press ripple on. It reaches the library through
   * `GOG_CONFIG` (see `ripple-preference.ts`), so flipping it re-runs every ripple-capable
   * component's own resolution — no reload, and no per-component input to keep in sync.
   */
  protected readonly isRippleOn = this.ripplePreference.enabled;

  /**
   * Both stateful header toggles change their glyph, not just their colour.
   *
   * Colour alone was the whole signal, and on a dark theme it does not carry: the accent an
   * active ghost button takes is close enough to the header's own foreground that the ripple
   * toggle read as "on" in both states. That is WCAG 1.4.1 in miniature — a state told by hue
   * and nothing else — and the fix is the same one the guideline asks for, a second channel.
   * A slashed droplet says "off" whatever the palette does; `aria-pressed` says it to a screen
   * reader; the accent stays as the third.
   *
   * Each glyph shows the state the site is in, not the one the button would switch to — the
   * same reading as the `aria-pressed` beside it, so the two cannot contradict each other. The
   * accessible name stays constant for the same reason it did when it was written.
   */
  protected readonly rippleIcon = computed(() => (this.isRippleOn() ? faDroplet : faDropletSlash));
  protected readonly directionIcon = computed(() => (this.isRtl() ? faAlignRight : faAlignLeft));

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

  protected toggleRipple(): void {
    this.ripplePreference.toggle();
  }

  protected toggleDirection(): void {
    this.isRtl.update((rtl) => !rtl);
  }

  protected toggleSearch(): void {
    if (this.isSearchOpen()) {
      this.closeSearch();
      return;
    }
    this.isSearchOpen.set(true);
    // The panel (and the input inside it) doesn't exist until this signal flips and Angular
    // renders it — a plain `.focus()` here would target last render's (absent) element. This
    // used to be a `queueMicrotask`, which is a race and not a guarantee: nothing orders a bare
    // microtask against Angular's own scheduler, so it happened to run after the render rather
    // than being required to. `afterNextRender` is the contract, and it also does the right
    // thing under SSR, where it simply never runs.
    afterNextRender(() => this.searchInput()?.nativeElement.focus(), { injector: this.injector });
  }

  protected closeSearch(): void {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.activeResultIndex.set(-1);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.activeResultIndex.set(-1);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (event.key === 'ArrowDown') {
      if (results.length === 0) return;
      event.preventDefault();
      this.activeResultIndex.update((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      if (results.length === 0) return;
      event.preventDefault();
      this.activeResultIndex.update((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      const target = results[this.activeResultIndex()] ?? results[0];
      if (target) {
        event.preventDefault();
        this.goToResult(target.path);
      }
    }
    // Escape is not handled here — the document-level listener (onEscape) already closes the
    // search panel, and handling it twice would just be redundant.
  }

  protected goToResult(path: string): void {
    this.router.navigateByUrl('/' + path);
    this.closeSearch();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isThemeMenuOpen()) {
      const switcher = this.elRef.nativeElement.querySelector('.theme-switcher');
      if (switcher && !switcher.contains(event.target as Node)) {
        this.closeThemeMenu();
      }
    }
    if (this.isSearchOpen()) {
      const search = this.elRef.nativeElement.querySelector('.nav-search');
      if (search && !search.contains(event.target as Node)) {
        this.closeSearch();
      }
    }
  }

  /** Escape closes whichever overlay is open — search first, then the theme menu, then the nav drawer. */
  protected onEscape(): void {
    if (this.isSearchOpen()) {
      this.closeSearch();
      return;
    }
    if (this.isThemeMenuOpen()) {
      this.closeThemeMenu();
      return;
    }
    this.closeNav();
  }
}
