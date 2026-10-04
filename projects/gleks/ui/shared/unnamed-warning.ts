import { isDevMode } from '@angular/core';

/** Selectors already warned about: one message per component per page, not one per instance. */
const warned = new Set<string>();

/**
 * Warns once, in dev mode, when `element` carries a role that needs a name and has none.
 *
 * For the components whose name only the consumer can know — a tablist, a progress bar, a
 * scrolling region — the library cannot pick a default without saying something false ("Loading"
 * on a bar that measures an upload), so an unnamed one would otherwise ship silently: read as
 * "progress bar, 62 percent", of nothing. Called after a render, because `aria-labelledby` can be
 * written by the consumer on the element itself and only the DOM says whether it was.
 */
export function gogWarnIfUnnamed(element: HTMLElement, selector: string, howToName: string): void {
  if (!isDevMode() || warned.has(selector)) return;
  const named =
    !!element.getAttribute('aria-label')?.trim() ||
    !!element.getAttribute('aria-labelledby')?.trim();
  if (named) return;
  warned.add(selector);
  console.warn(
    `[${selector}] has no accessible name, so a screen reader announces its role and nothing else. ${howToName}`,
    element,
  );
}

/** Test-only: forget which selectors have warned. */
export function gogResetUnnamedWarnings(): void {
  warned.clear();
}
