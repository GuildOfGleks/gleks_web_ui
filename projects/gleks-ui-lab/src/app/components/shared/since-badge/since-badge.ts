import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { isLatestVersion } from '../library-version';

/**
 * "Added in 21.4.0" — a chip marking API newer than some readers' installed version.
 *
 * Placed where the question is actually asked (next to the input, output or config key in an
 * API table), not on a release-notes page the reader would have to go looking for.
 *
 * **Only new API carries one.** An absent badge reads as "has been here a while", which is true
 * and costs nothing to maintain; back-filling every row to its introducing version would mean
 * reading the whole changelog history for a marker nobody needs. See `docs/lab-versioning.md`.
 */
@Component({
  selector: 'app-since',
  templateUrl: './since-badge.html',
  styleUrl: './since-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinceBadgeComponent {
  /** The version the API it sits next to first shipped in, e.g. `'21.4.0'`. */
  readonly version = input.required<string>();

  /**
   * The current release line gets a filled chip, older ones an outline: on any given visit the
   * reader is usually looking for what landed last, and this makes that scannable without
   * turning the whole page into highlights. The comparison itself lives in `library-version.ts`,
   * shared with the markdown renderer, which draws the same chip from hand-written HTML.
   */
  protected readonly isLatest = computed(() => isLatestVersion(this.version()));

  protected readonly label = computed(() => `Added in version ${this.version()}`);
}
