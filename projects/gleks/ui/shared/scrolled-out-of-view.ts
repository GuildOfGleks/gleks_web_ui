/**
 * Whether an overlay's anchor has been scrolled entirely out of sight — past the edge of the
 * viewport, or of any ancestor that clips its content (a `gog-scroll`, a table, a panel with
 * `overflow: hidden`).
 *
 * The overlays render into `<body>` and follow their anchor on scroll. Once the anchor is gone
 * they follow nothing the reader can see: a menu whose button has left the screen hung at the
 * screen's edge, over whatever the page pins there. Each overlay closes instead, the way Angular
 * CDK's `reposition` strategy does with `autoClose`.
 *
 * **Entirely**, not partly: an anchor half under the edge is still the thing the panel belongs to,
 * and closing on the first clipped pixel would shut a dropdown the reader is scrolling toward.
 *
 * An anchor with no box (`display: none`, or jsdom, which lays nothing out) reports `false`: it
 * cannot be measured, so it is not called out of view.
 */
export function gogScrolledOutOfView(anchor: Element): boolean {
  const view = anchor.ownerDocument.defaultView;
  if (!view) return false;

  const rect = anchor.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;

  let top = 0;
  let left = 0;
  let bottom = view.innerHeight;
  let right = view.innerWidth;

  for (let parent = anchor.parentElement; parent; parent = parent.parentElement) {
    const style = view.getComputedStyle(parent);
    // A `display: contents` box has no box to clip with, whatever its overflow says.
    const boxed = style.display !== 'contents';
    const clipsX = boxed && clips(style.overflowX);
    const clipsY = boxed && clips(style.overflowY);
    if (clipsX || clipsY) {
      const bounds = parent.getBoundingClientRect();
      if (clipsX) {
        left = Math.max(left, bounds.left);
        right = Math.min(right, bounds.right);
      }
      if (clipsY) {
        top = Math.max(top, bounds.top);
        bottom = Math.min(bottom, bounds.bottom);
      }
    }
    // Nothing above a fixed ancestor scrolls it.
    if (style.position === 'fixed') break;
  }

  return rect.bottom <= top || rect.top >= bottom || rect.right <= left || rect.left >= right;
}

/** An empty value is what a DOM without layout (jsdom) reports for an unset overflow. */
function clips(overflow: string): boolean {
  return overflow !== '' && overflow !== 'visible';
}
