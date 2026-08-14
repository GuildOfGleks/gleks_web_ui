/**
 * Which `data-theme` an overlay rendered into `<body>` has to carry, if any.
 *
 * A panel or tooltip bubble is appended to `<body>`, which puts it outside whatever subtree it
 * was opened from. `data-theme` can be scoped to any subtree — several themes rendering side by
 * side is a documented use — so an overlay opened inside one of those has to be told which theme
 * it belongs to, or it silently picks up the document's instead.
 *
 * **But only when the theme really is scoped.** When the nearest themed ancestor is the document
 * element, copying the attribute is not merely redundant, it is actively wrong: the overlay
 * already inherits everything from `<html>` through `<body>`, and re-stating `data-theme` on it
 * makes it match `theme.css`'s derived layer (`:root, [data-theme]`) *locally*. That re-declares
 * every component token on the overlay itself, resolved against the plain preset palette — which
 * discards anything set on `<html>` that is not part of that preset. Custom properties written
 * inline on `:root` are the case that bites: a live theme editor sets them there, the page
 * follows, and every portal keeps rendering the un-edited theme.
 *
 * So: return the theme only for a genuinely scoped ancestor, and let inheritance do the work
 * otherwise.
 *
 * Known limitation, currently unreachable: a *scoped* theme that is itself being edited through
 * inline custom properties would still lose those on the overlay, since only the attribute is
 * carried across. Copying resolved values instead would mean reading ~1200 properties on every
 * open, which is not worth it for a case nothing does yet.
 */
export function scopedOverlayTheme(
  themeSource: Element | null,
  documentElement: Element,
): string | null {
  const themedAncestor = themeSource?.closest('[data-theme]');
  if (!themedAncestor || themedAncestor === documentElement) return null;

  return themedAncestor.getAttribute('data-theme');
}
