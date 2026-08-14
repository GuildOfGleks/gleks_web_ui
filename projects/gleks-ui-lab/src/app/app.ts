import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent, ScrollComponent, ThemeService } from '@guildofgleks/ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { SidebarLeftComponent } from './components/shared/sidebar-left/sidebar-left';
import { TocComponent } from './components/shared/toc/toc';
import { LIBRARY_NPM_URL, LIBRARY_VERSION } from './components/shared/library-version';

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
    FaIconComponent,
    ButtonComponent,
    ScrollComponent,
    SidebarLeftComponent,
    TocComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeThemeMenu()',
  },
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  // Read from the installed package rather than written here, so the badge cannot claim a
  // version the site was not actually built against. See `library-version.ts`.
  protected readonly libraryVersion = LIBRARY_VERSION;
  protected readonly libraryNpmUrl = LIBRARY_NPM_URL;

  protected readonly footerLinks = FOOTER_LINKS;

  // The first two ship with the library itself; `slate` / `one-*` are its importable presets
  // (see the Theming page); `primeng` / `material` are this site's own look-alikes, declared in
  // styles.scss, for the comparison pages.
  protected readonly themeOptions: ThemeMenuOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'slate', label: 'Slate' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'one-light', label: 'One Light' },
    { value: 'primeng', label: 'PrimeNG' },
    { value: 'material', label: 'Material' },
  ];

  protected readonly activeTheme = computed(() => this.themeService.theme());
  protected readonly isThemeMenuOpen = signal(false);

  protected readonly faPalette = faPalette;

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

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isThemeMenuOpen()) return;

    const switcher = this.elRef.nativeElement.querySelector('.theme-switcher');
    if (switcher && !switcher.contains(event.target as Node)) {
      this.closeThemeMenu();
    }
  }
}
