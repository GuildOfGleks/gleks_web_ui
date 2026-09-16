import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { GOG_CONFIG, provideGogIcons } from '@guildofgleks/ui';

import { routes } from './app.routes';
import { CUSTOM_ICONS } from './legacy/custom-icons';
import { ShowcaseSettings } from './shell/showcase-settings';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    // A factory rather than `provideGogConfig`, because the value comes from the toolbar.
    {
      provide: GOG_CONFIG,
      useFactory: () => ({ ripple: { enabled: inject(ShowcaseSettings).ripple } }),
    },
    // Only the legacy icon page reads these.
    provideGogIcons(CUSTOM_ICONS),
  ],
};
