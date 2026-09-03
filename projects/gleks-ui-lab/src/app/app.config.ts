import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideLabGogConfig } from './components/shared/ripple-preference';
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
     * `ripple.enabled` is `false` in `@guildofgleks/ui` (`DEFAULT_RIPPLE`), and this site once
     * called `provideGogConfig` nowhere at all — so every ripple-capable component in every demo
     * was silently un-rippled, and "the ripple does not work" came back as a bug report that was
     * really "it was never switched on" (`docs/feedback-triage.md`, finding 3). A docs site that
     * ships a feature switched off is not documenting it.
     *
     * It now ships it on *and* lets the reader switch it off, from the header — because the
     * question the default raises ("do I want this?") is only answerable by seeing both. The
     * deviation is still stated wherever it shows: every component page listing
     * `GOG_CONFIG.ripple.enabled` renders a note saying the library ships it off and this site
     * does not (`global-config-note.html`). Do not add a second key here without doing the same
     * -- an undocumented deviation makes every demo on this site a slightly unreliable answer to
     * "what do I get out of the box?".
     *
     * See `ripple-preference.ts` for why this is a `GOG_CONFIG` provider with a getter rather
     * than a `provideGogConfig({ ripple: { enabled: true } })` call. An app that sets a static
     * value wants the helper, and that is what the site's own code samples show.
     */
    provideLabGogConfig(),
  ],
};
