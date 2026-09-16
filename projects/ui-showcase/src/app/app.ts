import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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

  protected setTheme(theme: string | number | null): void {
    if (theme !== null) this.themeService.setTheme(String(theme));
  }
}
