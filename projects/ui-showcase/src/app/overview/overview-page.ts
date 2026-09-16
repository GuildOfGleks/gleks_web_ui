import { ChangeDetectionStrategy, Component, computed, inject, VERSION } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@guildofgleks/ui';
import packageJson from '@guildofgleks/ui/package.json';

import { registryByGroup, registryCounts } from '../registry/registry';
import { ShowcaseSettings } from '../shell/showcase-settings';

/**
 * Everything the library exports, by unit. Plain HTML on purpose: the page that lists the
 * components must stay readable when one of them is broken.
 */
@Component({
  selector: 'app-overview-page',
  imports: [RouterLink],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  private readonly themeService = inject(ThemeService);
  protected readonly settings = inject(ShowcaseSettings);

  protected readonly libraryVersion: string = packageJson.version;
  protected readonly angularVersion = VERSION.full;
  protected readonly theme = computed(() => this.themeService.theme());
  protected readonly groups = registryByGroup();
  protected readonly counts = registryCounts();
}
