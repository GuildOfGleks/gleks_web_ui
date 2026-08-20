/**
 * Which writing direction a portaled overlay has to carry, if any.
 *
 * A dropdown panel or tooltip bubble is appended to `<body>`, which takes it out of whatever
 * subtree it was opened from. `dir` is inherited, so an overlay opened inside an RTL region of
 * an otherwise-LTR page would render LTR — text aligned the wrong way, the panel's own
 * `inset-inline-*` resolving against the wrong side. Copying the nearest scoped `dir` onto the
 * portal host fixes that, exactly as `scopedOverlayTheme` does for `data-theme`.
 *
 * **Only when the direction really is scoped.** When the nearest `[dir]` is the document
 * element — the ordinary case, a whole RTL app — the overlay already inherits it through
 * `<body>`, and re-stating it is noise on every panel in the app.
 *
 * Known limitation, shared with `scopedOverlayTheme`: a direction set through CSS
 * (`direction: rtl` in a stylesheet) rather than the `dir` attribute is not detected. Reading
 * `getComputedStyle().direction` would catch it, but that forces layout on every open for a
 * case the HTML spec itself discourages — `dir` is the attribute browsers, form controls and
 * assistive tech all key off.
 */
export function scopedOverlayDirection(
  directionSource: Element | null,
  documentElement: Element,
): 'ltr' | 'rtl' | null {
  const scoped = directionSource?.closest('[dir]');
  if (!scoped || scoped === documentElement || scoped === documentElement.ownerDocument?.body) {
    return null;
  }

  const dir = scoped.getAttribute('dir')?.trim().toLowerCase();
  return dir === 'rtl' || dir === 'ltr' ? dir : null;
}
