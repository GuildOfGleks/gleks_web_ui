import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { GogButtonDirective } from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { LIBRARY_NPM_URL, LIBRARY_VERSION } from '../../shared/library-version';

@Component({
  selector: 'app-agents-page',
  imports: [MarkdownComponent, GogButtonDirective],
  templateUrl: './agents-page.html',
  styleUrl: './agents-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentsPage {
  protected readonly libraryVersion = LIBRARY_VERSION;
  protected readonly libraryNpmUrl = LIBRARY_NPM_URL;

  /** Same URL the fetch below reads, so "Download" is just a link to the raw file. */
  protected readonly downloadUrl = '/docs/AGENTS.md';

  /**
   * `AGENTS.md` is copied out of `node_modules/@guildofgleks/ui` at build time (the asset glob
   * in `angular.json`) — the same mechanism `releases-page` uses for `CHANGELOG.md`, and for the
   * same reason: fetched rather than imported keeps the per-component reference out of the app
   * bundle, and reading the installed copy rather than a hand-maintained one here means this page
   * can never describe an input the reader's own `npm install` does not have.
   */
  private readonly agentsDoc = httpResource.text(() => '/docs/AGENTS.md');

  /** The file's own leading H1 dropped — this page already has one in its hero. */
  protected readonly markdown = computed(() => this.agentsDoc.value()?.replace(/^#\s+.*\r?\n/, ''));
  protected readonly hasContent = computed(() => this.agentsDoc.status() === 'resolved');
  protected readonly failed = computed(() => this.agentsDoc.status() === 'error');
}
