import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonComponent, ScrollComponent, ThemeService } from '@guildofgleks/ui';

import { showcaseThemes, type ShowcaseThemeName } from './showcase-themes';

interface ShowcaseNavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent, ScrollComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);

  protected readonly title = signal('Gleks UI Showcase');
  protected readonly themes = showcaseThemes;
  /**
   * Temporarily off while the component showcase pages are being rewritten, so every
   * page renders the library's pristine default theme (see styles.scss) instead of the
   * showcase's own "Classic" branding. Flip back on once that's done.
   */
  protected readonly themeSwitcherEnabled = false;
  protected readonly activeTheme = computed(() => this.themeService.theme() as ShowcaseThemeName);
  protected readonly themeLabel = computed(
    () =>
      this.themes.find((theme) => theme.name === this.activeTheme())?.label ?? this.activeTheme(),
  );
  protected readonly themeSummary = computed(
    () => this.themes.find((theme) => theme.name === this.activeTheme())?.summary ?? '',
  );

  protected readonly navLinks: ShowcaseNavLink[] = [
    { path: 'themes', label: 'Themes' },
    { path: 'buttons', label: 'Button' },
    { path: 'checkbox', label: 'Checkbox' },
    { path: 'inputfield', label: 'Inputfield' },
    { path: 'chip', label: 'Chip' },
    { path: 'select', label: 'Select' },
    { path: 'multiselect', label: 'Multiselect' },
    { path: 'table', label: 'Table' },
    { path: 'scroll', label: 'Scroll' },
    { path: 'paginator', label: 'Paginator' },
    { path: 'slider', label: 'Slider' },
    { path: 'spinner', label: 'Spinner' },
    { path: 'skeleton', label: 'Skeleton' },
    { path: 'accordion', label: 'Accordion' },
    { path: 'toast', label: 'Toast' },
    { path: 'tag', label: 'Tag' },
    { path: 'dialog', label: 'Dialog' },
  ];

  protected readonly pageLinks: ShowcaseNavLink[] = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'settings', label: 'Settings' },
    { path: 'catalog', label: 'Catalog' },
    { path: 'onboarding', label: 'Onboarding' },
  ];

  protected isActiveTheme(theme: ShowcaseThemeName): boolean {
    return this.activeTheme() === theme;
  }

  protected setTheme(theme: ShowcaseThemeName): void {
    this.themeService.setTheme(theme);
  }
}
