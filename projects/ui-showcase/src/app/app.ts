import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  type GogDropdownOption,
  SelectComponent,
  ThemeService,
  ToggleComponent,
} from '@guildofgleks/ui';

import { legacyRoutes } from './legacy/legacy.routes';
import { registryByGroup } from './registry/registry';
import { ShowcaseSettings } from './shell/showcase-settings';
import { THEMES } from './shell/themes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SelectComponent, ToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);
  protected readonly settings = inject(ShowcaseSettings);

  protected readonly groups = registryByGroup();
  protected readonly legacyPaths = legacyRoutes
    .map((route) => route.path)
    .filter((path): path is string => !!path);

  protected readonly themeOptions: GogDropdownOption[] = THEMES.map((theme) => ({
    id: theme.name,
    name: theme.label,
  }));
  protected readonly theme = computed(() => this.themeService.theme());

  constructor() {
    // The router scrolls to an anchor without reading `scroll-margin`, so it is told how tall
    // the toolbar is while it is sticky. Called only when it scrolls, which is only in the browser.
    const document = inject(DOCUMENT);
    inject(ViewportScroller).setOffset(() => {
      const bar = document.querySelector('.shell__bar');
      const sticky = bar !== null && getComputedStyle(bar).position === 'sticky';
      return [0, sticky ? bar.getBoundingClientRect().height : 0];
    });
  }

  protected setTheme(theme: string | number | null): void {
    if (theme !== null) this.themeService.setTheme(String(theme));
  }
}
