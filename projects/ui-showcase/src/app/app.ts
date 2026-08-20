import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  GogDropdownOption,
  ScrollComponent,
  SelectComponent,
  ThemeService,
  ToggleComponent,
} from '@guildofgleks/ui';

import { showcaseThemes, type ShowcaseThemeName } from './showcase-themes';

interface ShowcaseNavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ScrollComponent,
    SelectComponent,
    ToggleComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  protected readonly title = signal('Gleks UI Showcase');

  /**
   * Flips `dir` on `<html>` for the whole showcase. Every component is meant to mirror off that
   * one attribute — logical properties in the stylesheets, `dir` copied onto portaled overlays,
   * the tooltip's `auto` side, the calendar's arrows — so this toggle exercises all of it at
   * once, and keeps doing so after the change that introduced it. A one-off check in DevTools
   * would not survive the next component.
   */
  protected readonly isRtl = signal(false);

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('dir', this.isRtl() ? 'rtl' : 'ltr');
    });
  }
  protected readonly themes = showcaseThemes;
  protected readonly themeOptions: GogDropdownOption[] = showcaseThemes.map((theme) => ({
    id: theme.name,
    name: theme.label,
  }));
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
    { path: 'radio-group', label: 'Radio Group' },
    { path: 'inputfield', label: 'Inputfield' },
    { path: 'textarea', label: 'Textarea' },
    { path: 'chip', label: 'Chip' },
    { path: 'select', label: 'Select' },
    { path: 'multiselect', label: 'Multiselect' },
    { path: 'menu', label: 'Menu' },
    { path: 'table', label: 'Table' },
    { path: 'scroll', label: 'Scroll' },
    { path: 'paginator', label: 'Paginator' },
    { path: 'slider', label: 'Slider' },
    { path: 'spinner', label: 'Spinner' },
    { path: 'skeleton', label: 'Skeleton' },
    { path: 'accordion', label: 'Accordion' },
    { path: 'collapsible', label: 'Collapsible' },
    { path: 'toast', label: 'Toast' },
    { path: 'tooltip', label: 'Tooltip' },
    { path: 'tag', label: 'Tag' },
    { path: 'dialog', label: 'Dialog' },
    { path: 'autocomplete', label: 'Autocomplete' },
    { path: 'datepicker', label: 'Datepicker' },
    { path: 'button-toggle', label: 'Button Toggle' },
    { path: 'toggle', label: 'Toggle' },
    { path: 'tabs', label: 'Tabs' },
    { path: 'progressbar', label: 'Progressbar' },
    { path: 'badge', label: 'Badge' },
    { path: 'divider', label: 'Divider' },
    { path: 'icon', label: 'Icon' },
  ];

  protected readonly pageLinks: ShowcaseNavLink[] = [
    { path: 'global-config', label: 'Global Config' },
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'settings', label: 'Settings' },
    { path: 'catalog', label: 'Catalog' },
    { path: 'onboarding', label: 'Onboarding' },
  ];

  protected readonly benchmarkLinks: ShowcaseNavLink[] = [
    { path: 'benchmark', label: 'Overview' },
    { path: 'benchmark/table', label: 'Table' },
    { path: 'benchmark/accordion', label: 'Accordion' },
    { path: 'benchmark/dropdown', label: 'Select / Multiselect / Autocomplete' },
    { path: 'benchmark/instances', label: 'Everything else' },
  ];

  protected setTheme(theme: string | number | null): void {
    if (theme === null) return;
    this.themeService.setTheme(String(theme));
  }
}
