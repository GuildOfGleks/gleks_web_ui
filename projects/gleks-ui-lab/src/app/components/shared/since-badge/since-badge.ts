import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LIBRARY_VERSION } from '../library-version';

/** `'21.4.1'` → `'21.4'`. */
function minor(version: string): string {
  return version.split('.').slice(0, 2).join('.');
}

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
   * turning the whole page into highlights.
   *
   * Compared at major.minor, not exactly: a patch release adds no API, so `21.4.0`'s additions
   * are still "what's new" for someone who installed `21.4.1`. Comparing the full version would
   * un-highlight the whole feature set the moment a bug fix shipped.
   */
  protected readonly isLatest = computed(() => minor(this.version()) === minor(LIBRARY_VERSION));

  protected readonly label = computed(() => `Added in version ${this.version()}`);
}
