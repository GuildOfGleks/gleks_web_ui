import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  TabComponent,
  TabsComponent,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { LIBRARY_NPM_URL, LIBRARY_VERSION } from '../../shared/library-version';

/**
 * Every release heading in the package's changelog.
 *
 * `##` is the release level and nothing else uses it — the notes inside a release are all `###`.
 * Anchored on `^` so a version mentioned mid-paragraph — "those two overran their announced
 * 21.4.0 removal" — cannot be mistaken for a heading.
 */
const RELEASE_HEADING = /^## (.+)$/gm;

/**
 * The usual heading shape, `[21.4.3] - 16.08.2026`, split into version and date.
 *
 * Not every heading fits it: the file ends with `[0.0.1] through 0.2.2`, one entry covering the
 * pre-changelog releases. Matching only the regular shape used to drop that heading from the
 * list *and* leave its body glued to the release above it, so it is handled rather than skipped.
 */
const VERSION_AND_DATE = /^\[([^\]]+)\] - (.+)$/;

interface Release {
  /** Tab label. The version alone where the heading gives one, otherwise the whole heading. */
  readonly version: string;
  /** Empty for a heading that carries no date, which the template then omits. */
  readonly date: string;
  readonly unreleased: boolean;
  /** The release's own notes, without the `##` heading the tab label replaces. */
  readonly notes: string;
}

/** How many releases get a tab in the open row before the rest fold away. */
const RECENT_COUNT = 3;

@Component({
  selector: 'app-releases-page',
  imports: [
    MarkdownComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    TabsComponent,
    TabComponent,
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
  private readonly markdown = computed(() => this.changelog.value()?.replace(/^#\s+.*\r?\n/, ''));
  protected readonly hasContent = computed(() => this.changelog.status() === 'resolved');
  protected readonly failed = computed(() => this.changelog.status() === 'error');

  /**
   * The changelog split at its version headings: one entry per release, carrying its own notes.
   *
   * The page used to render the whole file as a single document with a row of jump links above
   * it. Twelve releases of history made that a very long page whose useful part — the version
   * the reader is on, and the one above it — was the first screen and nothing else. Splitting it
   * lets each release own a tab panel, and costs nothing at load: the panels are built eagerly
   * (see the template) so every release is still in the HTML a crawler receives.
   */
  private readonly releases = computed<readonly Release[]>(() => {
    const source = this.markdown();
    if (!source) return [];

    // `matchAll` needs the `g` flag and does not advance the shared regex's `lastIndex` — it
    // matches against an internal clone — so `RELEASE_HEADING` is safe to keep at module scope.
    const headings = Array.from(source.matchAll(RELEASE_HEADING));

    return headings.map((match, index) => {
      const start = match.index + match[0].length;
      const end = headings[index + 1]?.index ?? source.length;

      const heading = match[1].trim();
      const versioned = VERSION_AND_DATE.exec(heading);
      const date = versioned?.[2].trim() ?? '';

      return {
        version: versioned?.[1] ?? heading.replace(/[[\]]/g, ''),
        date,
        unreleased: date === 'planned',
        notes: source.slice(start, end).trim(),
      };
    });
  });

  /**
   * Whatever precedes the first release heading — the "not yet 1.0" note. It describes the file
   * rather than any one release, so it stays above the tabs instead of being folded into one.
   */
  protected readonly intro = computed(() => {
    const source = this.markdown();
    if (!source) return '';

    const first = source.match(RELEASE_HEADING)?.[0];
    const at = first ? source.indexOf(first) : -1;
    return (at === -1 ? source : source.slice(0, at)).trim();
  });

  /**
   * The changelog is newest-first, so the head of the list is what almost every visit is after —
   * "what changed in the version I am on, or the one above it". The tail is history.
   */
  protected readonly recentReleases = computed(() => this.releases().slice(0, RECENT_COUNT));
  protected readonly olderReleases = computed(() => this.releases().slice(RECENT_COUNT));

  /**
   * Opens on the version the reader actually has installed, rather than on the first tab.
   *
   * The top of the changelog is usually the *planned* release, which nobody can install — landing
   * there means the page opens on notes for a version that does not exist yet. `linkedSignal`
   * rather than `computed` because `gog-tabs` writes back to it through `[(activeIndex)]`: the
   * source changes exactly once, when the fetch resolves, and every click after that is the
   * reader's. Falls back to the first tab if the installed version has scrolled out of the recent
   * row, which is what happens between a release and this site's redeploy.
   */
  protected readonly recentIndex = linkedSignal(() => {
    const index = this.recentReleases().findIndex(
      (release) => release.version === this.libraryVersion,
    );
    return index === -1 ? 0 : index;
  });
}
