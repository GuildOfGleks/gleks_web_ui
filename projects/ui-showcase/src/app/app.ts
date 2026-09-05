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

  /**
   * Paints the invisible half of WCAG 2.5.8.
   *
   * Where a control paints smaller than 24x24, the library does not grow it — it grows the
   * *target*, with a transparent `::before` centred on the control (`styling.instructions.md`,
   * law 5). That is the right fix and it is completely invisible, which means nobody can check
   * it, nobody notices when it regresses, and a reviewer has to take the commit message's word
   * for it. This toggle outlines every one of those pseudo-elements.
   *
   * It also earns its keep the other way round: an inflated hit area that outlives its reason is
   * a click target that lies about where the button is, and with this on you can see one
   * overlapping something it should not.
   */
  protected readonly showHitAreas = signal(false);

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('dir', this.isRtl() ? 'rtl' : 'ltr');
    });
    effect(() => {
      this.document.body.classList.toggle('app-show-hit-areas', this.showHitAreas());
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
    { path: 'card', label: 'Card' },
    { path: 'panel', label: 'Panel' },
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
    { path: 'ripple', label: 'Ripple' },
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
