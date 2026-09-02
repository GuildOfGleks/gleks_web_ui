// Flattens `NAV_SECTIONS` (every page in the sidebar, general and components alike) into one
// searchable list for the header search. No hand-maintained keyword list: each entry's
// `keywords` is the page's own SEO description (`seo-data.ts`), which already reads like a
// blurb full of synonyms — "modal dialog", "segmented control", "show/hide primitive" — written
// for a search *engine* result, and just as useful for this site's own search box.

import { NavItem, NavSection } from '../types/nav-item';
import { NAV_SECTIONS } from './nav-data';
import { PAGE_SEO } from './seo-data';

export interface SearchEntry {
  readonly label: string;
  readonly path: string;
  readonly keywords: string;
}

function toEntry(item: NavItem): SearchEntry {
  return { label: item.label, path: item.path, keywords: PAGE_SEO[item.path]?.description ?? '' };
}

function flattenItems(items: readonly NavItem[]): SearchEntry[] {
  return items.flatMap((item) => [
    toEntry(item),
    ...(item.children ? flattenItems(item.children) : []),
  ]);
}

function flattenSection(section: NavSection): SearchEntry[] {
  if (section.items) return flattenItems(section.items);
  if (section.groups) return section.groups.flatMap((group) => flattenItems(group.items));
  return [];
}

export const SEARCH_INDEX: readonly SearchEntry[] = NAV_SECTIONS.flatMap(flattenSection);

/**
 * Label matches first (a reader typing "select" wants the Select page above anything that
 * merely mentions selection), then keyword matches, each group alphabetical by label. Case- and
 * whitespace-insensitive; an empty query returns nothing rather than the whole index — there is
 * nothing to rank yet.
 */
export function searchNav(query: string, limit = 8): readonly SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const byLabel: SearchEntry[] = [];
  const byKeyword: SearchEntry[] = [];
  for (const entry of SEARCH_INDEX) {
    if (entry.label.toLowerCase().includes(q)) byLabel.push(entry);
    else if (entry.keywords.toLowerCase().includes(q)) byKeyword.push(entry);
  }

  const byLabelAsc = [...byLabel].sort((a, b) => a.label.localeCompare(b.label));
  const byKeywordAsc = [...byKeyword].sort((a, b) => a.label.localeCompare(b.label));
  return [...byLabelAsc, ...byKeywordAsc].slice(0, limit);
}
