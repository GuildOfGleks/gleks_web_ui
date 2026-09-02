import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideGogConfig } from '@guildofgleks/ui';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),

    /**
     * The one place this site departs from the library's defaults, and it is on purpose.
     *
     * `ripple.enabled` is `false` in `@guildofgleks/ui` (`DEFAULT_RIPPLE`), and until now this
     * site called `provideGogConfig` nowhere at all — so every ripple-capable component in every
     * demo was silently un-rippled, and "the ripple does not work" came back as a bug report that
     * was really "it was never switched on" (`docs/feedback-triage.md`, finding 3). A docs site
     * that ships a feature switched off is not documenting it.
     *
     * Because this *is* a departure from the default, it is stated wherever it shows: every
     * component page listing `GOG_CONFIG.ripple.enabled` renders a note saying the site turns it
     * on and the library does not (`global-config-note.html`). Do not add a second key here
     * without doing the same -- an undocumented deviation makes every demo on this site a
     * slightly unreliable answer to "what do I get out of the box?".
     */
    provideGogConfig({ ripple: { enabled: true } }),
  ],
};
