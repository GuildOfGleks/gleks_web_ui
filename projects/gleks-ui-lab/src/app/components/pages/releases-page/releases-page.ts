import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import {
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { slugify } from '../../shared/markdown/markdown-renderer';
import { LIBRARY_NPM_URL, LIBRARY_VERSION } from '../../shared/library-version';

/**
 * A `## [<version>] - <date|planned>` heading in the package's changelog.
 *
 * Anchored on `^` so a version mentioned mid-paragraph — "those two overran their announced
 * 21.4.0 removal" — cannot be mistaken for a release heading.
 */
const VERSION_HEADING = /^## \[([^\]]+)\] - (.+)$/gm;

interface ReleaseLink {
  readonly version: string;
  readonly date: string;
  readonly id: string;
  readonly unreleased: boolean;
}

/** How many releases stay in the open row before the rest fold away. */
const RECENT_COUNT = 3;

@Component({
  selector: 'app-releases-page',
  imports: [
    MarkdownComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
  ],
  templateUrl: './releases-page.html',
  styleUrl: './releases-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleasesPage {
  protected readonly libraryVersion = LIBRARY_VERSION;
  protected readonly libraryNpmUrl = LIBRARY_NPM_URL;

  /**
   * The changelog of the exact package this site was built against.
   *
   * `CHANGELOG.md` is copied out of `node_modules/@guildofgleks/ui` at build time (the asset
   * glob in `angular.json`), which is the whole point of the page: the notes cannot drift from
   * the version in the header badge, because they are the same artifact. Fetched rather than
   * imported so ~68 KB of release history stays out of the app bundle — the same trade
   * `full-library-css.ts` makes for the stylesheets.
   */
  private readonly changelog = httpResource.text(() => '/docs/CHANGELOG.md');

  /**
   * The changelog with its own `# Changelog` title dropped.
   *
   * The file opens with an H1 and an explanatory paragraph. The paragraph is worth keeping — it
   * is where "not yet 1.0, so breaking changes may land in minor versions" is stated — but the
   * H1 is not: this page already has one in its hero, and two `<h1>`s is a page that tells a
   * crawler two different things it is about. Only a *leading* H1 is removed, so a stray `#`
   * later in the file (there is none today) would survive.
   */
  protected readonly markdown = computed(() => this.changelog.value()?.replace(/^#\s+.*\r?\n/, ''));
  protected readonly hasContent = computed(() => this.changelog.status() === 'resolved');
  protected readonly failed = computed(() => this.changelog.status() === 'error');

  /**
   * Jump links for the version headings.
   *
   * Built by running the *same* `slugify` the markdown renderer uses over the same heading
   * text, rather than by guessing the anchor format: the renderer strips `[`, `]` and `.`, so
   * `## [21.4.3] - 16.08.2026` anchors as `2143---16082026` and any hand-written `#21-4-3`
   * would quietly land nowhere.
   */
  protected readonly releases = computed<readonly ReleaseLink[]>(() => {
    const source = this.markdown();
    if (!source) return [];

    return Array.from(source.matchAll(VERSION_HEADING), ([heading, version, date]) => ({
      version,
      date,
      id: slugify(heading.replace(/^## /, '')),
      unreleased: date.trim() === 'planned',
    }));
  });

  /**
   * The changelog is newest-first, so the head of the list is what almost every visit is after —
   * "what changed in the version I am on, or the one above it". The tail is history, and eleven
   * badges of it pushed the notes themselves below the fold.
   */
  protected readonly recentReleases = computed(() => this.releases().slice(0, RECENT_COUNT));
  protected readonly olderReleases = computed(() => this.releases().slice(RECENT_COUNT));

  /**
   * `index.html` declares `<base href="/">`, which the browser uses to resolve bare fragment
   * hrefs too — so `href="#2143---16082026"` resolves against the *root*, and clicking one
   * navigated away from this page and reloaded it. The same trap is documented in `toc.ts`;
   * the fix is the same, an absolute-path href plus a handler that scrolls instead.
   */
  protected readonly currentPath = signal('');

  constructor() {
    afterNextRender(() => {
      this.currentPath.set(`${window.location.pathname}${window.location.search}`);
    });
  }

  protected onJump(event: MouseEvent, id: string): void {
    event.preventDefault();
    // `behavior: 'instant'`, not `'smooth'` — the content area is a `gog-scroll`, whose
    // `contain: layout style` stops the browser's smooth-scroll engine moving it at all. Same
    // finding, and the same choice, as `toc.ts`.
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
  }
}
