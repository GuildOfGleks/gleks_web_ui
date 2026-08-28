import type { GogAccordionItem, GogDeprecation } from '@guildofgleks/ui';

export interface DeprecatedTokenRow {
  readonly oldName: string;
  readonly newName: string;
}

export interface DeprecatedTokenGroup extends GogAccordionItem {
  readonly oldPrefix: string;
  readonly newPrefix: string;
  readonly since: string;
  readonly sinceDate: string;
  readonly removedIn: string;
  readonly tokens: readonly DeprecatedTokenRow[];
}

/** Longest string every entry starts with — `''` for an empty or non-overlapping list. */
function commonPrefix(strings: readonly string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (const s of strings.slice(1)) {
    while (prefix.length > 0 && !s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Groups `GOG_DEPRECATIONS`' token half by short-name prefix, not by component name — this file
 * has no list of component names to key on, and doesn't need one. Every deprecated token this
 * library has ever shipped is spelled `--gog-<shortPrefix>-<rest>`, so the segment right after
 * `--gog-` (`'btn'`, `'ms'`, `'confirm'`, ...) is the group key; `oldPrefix`/`newPrefix` are then
 * read back off the data as the longest prefix every member's name/replacement actually shares,
 * rather than assumed from a naming convention.
 *
 * **Not grouped by `since`/`sinceDate`/`removedIn`** — that looks like the natural "same
 * announcement" key, but `--gog-btn-*` and `--gog-confirm-*` were both deprecated on the same day
 * for the same removal version, so that triple collides between two unrelated prefixes and merges
 * them into one group with a meaningless common prefix (`--gog-*`). Caught in a browser, not by a
 * type check — the grouping key that looks obviously right from the data's own shape is the one
 * that doesn't hold once two independent renames happen to land in the same release.
 *
 * Generated input, derived grouping — this cannot drift from what the library actually ships the
 * way a hand-written "three prefixes: ..." sentence can. See `docs/lab-versioning.md`, layer 4.
 */
export function groupDeprecatedTokens(
  deprecations: readonly GogDeprecation[],
): DeprecatedTokenGroup[] {
  const byPrefix = new Map<string, GogDeprecation[]>();
  for (const dep of deprecations) {
    if (dep.kind !== 'token') continue;
    // '--gog-btn-bg'.split('-') === ['', '', 'gog', 'btn', 'bg'] — index 3 is the short prefix.
    const key = dep.name.split('-')[3] ?? dep.name;
    const group = byPrefix.get(key);
    if (group) group.push(dep);
    else byPrefix.set(key, [dep]);
  }

  return [...byPrefix.values()]
    .map((deps): DeprecatedTokenGroup => {
      const { since, sinceDate, removedIn } = deps[0];
      const newPrefix = commonPrefix(deps.map((d) => d.replacement));
      const oldPrefix = commonPrefix(deps.map((d) => d.name));
      return {
        id: newPrefix || oldPrefix,
        title: `${oldPrefix}* → ${newPrefix}* — ${deps.length} token${deps.length === 1 ? '' : 's'}`,
        oldPrefix,
        newPrefix,
        since,
        sinceDate,
        removedIn,
        tokens: deps
          .map((d) => ({ oldName: d.name, newName: d.replacement }))
          .sort((a, b) => a.newName.localeCompare(b.newName)),
      };
    })
    .sort((a, b) => a.newPrefix.localeCompare(b.newPrefix));
}
