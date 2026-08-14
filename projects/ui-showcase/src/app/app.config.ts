import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideGogIcons } from '@guildofgleks/ui';

import { routes } from './app.routes';
import { CUSTOM_ICONS } from './custom-icons';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // Registered once here; every `gog-icon` and every icon-name input in the app can use them.
    provideGogIcons(CUSTOM_ICONS),
  ],
};
