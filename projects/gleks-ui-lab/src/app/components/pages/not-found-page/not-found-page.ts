import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SuggestedLink {
  readonly label: string;
  readonly path: string;
}

/**
 * The site's 404. It exists to stop unknown URLs being a *soft* 404 — the router used to send
 * `**` to `general/overview`, so every typo and every stale inbound link answered `200` on an
 * indexable page, which Google reads as duplicate content and charges to the crawl budget.
 *
 * **The status code is what makes this work, and it is not set here.** `app.routes.server.ts`
 * gives the `**` server route `status: 404`; a page that merely says "not found" while the
 * response says `200` changes nothing for a crawler. `noindex` comes for free — `SeoService`
 * marks any path missing from `PAGE_SEO` as `noindex, follow`, and this one deliberately stays
 * out of that table so the rule applies to it too.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  // A short hand-picked list rather than the whole of `nav-data.ts`: the sidebar is already on
  // screen next to this page, so repeating it would be noise. These are the three places a
  // reader who mistyped a URL actually wanted.
  protected readonly suggestions: readonly SuggestedLink[] = [
    { label: 'Overview', path: '/general/overview' },
    { label: 'Getting Started', path: '/general/getting-started' },
    { label: 'Components', path: '/components/button' },
  ];
}
