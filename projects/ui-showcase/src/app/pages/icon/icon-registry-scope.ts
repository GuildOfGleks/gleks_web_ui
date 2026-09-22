import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogIcons } from '@guildofgleks/ui';

/**
 * A second registration below the app's own: it shares a name with a built-in, `copy`, to show a
 * registration winning over the library's glyph — and it layers onto the app's `cart` and
 * `rocket` rather than replacing them.
 */
export const SCOPED_ICONS = {
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16V6a2 2 0 0 1 2-2h10"/><rect width="14" height="14" x="6" y="6" rx="2"/></svg>`,
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this registration. */
@Component({
  selector: 'app-icon-registry-scope',
  template: '<ng-content />',
  providers: [provideGogIcons(SCOPED_ICONS)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconRegistryScope {}
