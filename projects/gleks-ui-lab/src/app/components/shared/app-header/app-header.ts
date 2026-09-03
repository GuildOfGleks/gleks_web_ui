import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, GogTooltipDirective, ThemeService } from '@guildofgleks/ui';
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

import { DirectionPreference } from '../direction-preference';
import { LIBRARY_VERSION } from '../library-version';
import { RipplePreference } from '../ripple-preference';
import { SearchEntry, searchNav } from '../search-index';

interface ThemeMenuOption {
  value: string;
  label: string;
}

/**
 * The site's header: the logo and version badge, the component search, the three controls that
 * change how the docs are shown, and the drawer button for narrow screens.
 *
 * It owns its two overlays — the search panel and the theme menu — including the document click
 * that dismisses them. Escape is the exception: the app shell keeps that listener, because the
 * priority order runs *past* this component (search, then theme menu, then the nav drawer, which
 * is the shell's) and splitting it across two files would leave that order stated nowhere.
 * {@link closeOverlays} is how the shell asks whether this component consumed the key.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, FaIconComponent, ButtonComponent, GogTooltipDirective],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AppHeader {
  private readonly themeService = inject(ThemeService);
  private readonly ripplePreference = inject(RipplePreference);
  private readonly directionPreference = inject(DirectionPreference);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** The drawer's state lives in the shell, which renders the drawer; this only draws its button. */
  readonly navOpen = input(false);
  readonly navToggle = output<void>();

  protected readonly libraryVersion = LIBRARY_VERSION;

  // `light` and `dark` are built into `theme.css`; the other nine are the package's presets,
  // each loaded as its own stylesheet (see angular.json).
  protected readonly themeOptions: ThemeMenuOption[] = [
    { value: 'light', label: 'Classic' },
    { value: 'dark', label: 'Dark' },
    { value: 'slate', label: 'Slate' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'one-light', label: 'One Light' },
    { value: 'ledger', label: 'Ledger' },
    { value: 'material', label: 'Material' },
    { value: 'primeng', label: 'PrimeNG' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'bevel', label: 'Bevel' },
    { value: 'parchment', label: 'Parchment' },
  ];
  protected readonly activeTheme = computed(() => this.themeService.theme());
  protected readonly isThemeMenuOpen = signal(false);

  protected readonly isSearchOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly searchResults = computed<readonly SearchEntry[]>(() =>
    searchNav(this.searchQuery()),
  );
  protected readonly activeResultIndex = signal(-1);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

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
   * Both stateful toggles state themselves through `gog-button`'s `ariaPressed`/`ariaExpanded`/
   * `ariaControls` inputs (21.8.0). Before those existed each one carried its state in its
   * accessible *name* instead, because an `[attr.aria-*]` binding on `<gog-button>` lands on the
   * roleless custom-element host and never reaches the `<button>` inside. The name is stable
   * again now; a name that changed under the user was the compromise, not the goal. Do not
   * "restore" a host attribute binding here — it would silently do nothing.
   */
  protected readonly searchPanelId = computed(() =>
    this.isSearchOpen() ? 'nav-search-panel' : null,
  );

  protected readonly isRippleOn = this.ripplePreference.enabled;
  protected readonly isRtl = this.directionPreference.isRtl;

  /**
   * Both stateful toggles change their glyph, not just their colour.
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

  protected readonly faBars = faBars;
  protected readonly faPalette = faPalette;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;

  /**
   * Closes whichever of this header's overlays is open, innermost first, and says whether it
   * closed anything — the shell's Escape handler falls through to the nav drawer when it did not.
   */
  closeOverlays(): boolean {
    if (this.isSearchOpen()) {
      this.closeSearch();
      return true;
    }
    if (this.isThemeMenuOpen()) {
      this.closeThemeMenu();
      return true;
    }
    return false;
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
    this.directionPreference.toggle();
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
    // Escape is not handled here — the shell's document-level listener already closes the search
    // panel through `closeOverlays`, and handling it twice would just be redundant.
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
}
