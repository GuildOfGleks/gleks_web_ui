import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import {
  FALLBACK_SEO,
  HOME_PATH,
  NOT_FOUND_SEO,
  PAGE_SEO,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
  type PageSeo,
} from './seo-data';

/**
 * Keeps `<title>`, the description, the canonical URL and the social-card tags in step with the
 * current route.
 *
 * **This runs during SSR, which is the entire point.** The lab is server-rendered
 * (`app.routes.server.ts`), so the router completes a navigation while the page is being
 * rendered on the server — the tags below are therefore in the HTML a crawler receives, not
 * something applied afterwards by a script it may never run. A single hardcoded `<title>` in
 * `index.html` (what this replaced) meant every one of the site's 38 pages appeared in search
 * results under the same name.
 *
 * Pages not listed in `PAGE_SEO` get `noindex`: `app.routes.ts` ends in `components/:name` and
 * `general/:slug` catch-alls that render for *any* slug, so without this a crawler that guessed
 * or mistyped a URL would find an indexable, near-empty page — thin duplicates of the real ones,
 * which is the one thing an otherwise small site can do to hurt itself.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  // Captured here rather than relying on `init()` being called from an injection context, so
  // the service works wherever it is started from.
  private readonly destroyRef = inject(DestroyRef);

  /** Called once from `App` — a root service nobody injects would never be constructed. */
  init(): void {
    this.apply(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  private apply(url: string): void {
    // `/general/theming#tokens?x=1` → `general/theming`. The canonical URL never carries a
    // fragment or query: they address a position on the page, not a different page, and letting
    // them into the canonical is how one page becomes several in an index.
    const path = url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    const page: PageSeo | undefined = PAGE_SEO[path];
    const seo = page ?? (this.isNotFound() ? NOT_FOUND_SEO : FALLBACK_SEO);

    // The home page is reached at `/` (which redirects) as well as at its own path; both must
    // point at one canonical URL or they compete with each other for the same content.
    const canonical =
      path === '' || path === HOME_PATH ? `${SITE_URL}/${HOME_PATH}` : `${SITE_URL}/${path}`;

    this.title.setTitle(seo.title);
    this.setName('description', seo.description);
    this.setName('robots', page || path === '' ? 'index, follow' : 'noindex, follow');
    this.setCanonical(canonical);

    this.setProperty('og:title', seo.title);
    this.setProperty('og:description', seo.description);
    this.setProperty('og:url', canonical);
    this.setProperty('og:type', 'website');
    this.setProperty('og:site_name', SITE_NAME);
    this.setProperty('og:image', SOCIAL_IMAGE);

    this.setName('twitter:card', 'summary');
    this.setName('twitter:title', seo.title);
    this.setName('twitter:description', seo.description);
    this.setName('twitter:image', SOCIAL_IMAGE);
  }

  /**
   * Whether the navigation landed on `app.routes.ts`'s `**` route, which flags itself with
   * `data: { notFound: true }`. Read from the resolved route rather than guessed from the path,
   * so the service does not carry a second copy of the routing rules.
   *
   * Walks to the deepest activated child because `data` is not inherited upward and the routed
   * page is a leaf. Returns `false` when the router state is not yet populated — that only
   * happens on the `init()` call made before the first navigation completes, which the
   * `NavigationEnd` subscription immediately supersedes.
   */
  private isNotFound(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data['notFound'] === true;
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    // `property=` rather than `name=`, and the selector has to match it, or `updateTag` appends
    // a second copy of every Open Graph tag on each navigation instead of replacing it.
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }

  private setCanonical(href: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
