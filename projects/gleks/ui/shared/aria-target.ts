/** What can take focus — the set every "which element is the control" question here answers from. */
export const GOG_FOCUSABLE =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * The element that ARIA about `host` belongs on: `host` itself when it takes focus, else the first
 * element inside it that does — `gog-button` renders its own `<button>`, `gog-chip` its surface —
 * else `host`. A directive that wrote its attributes onto a component's roleless host reached no
 * assistive tech at all.
 */
export function gogAriaTarget(host: HTMLElement): HTMLElement {
  if (host.matches(GOG_FOCUSABLE)) return host;
  return host.querySelector<HTMLElement>(GOG_FOCUSABLE) ?? host;
}

/** Adds `id` to an id-list attribute (`aria-describedby`, `aria-controls`), keeping the rest. */
export function gogAddIdRef(element: Element, attribute: string, id: string): void {
  const ids = idList(element, attribute);
  if (!ids.includes(id)) element.setAttribute(attribute, [...ids, id].join(' '));
}

/** Removes `id` from an id-list attribute, and the attribute once it is empty. */
export function gogRemoveIdRef(element: Element, attribute: string, id: string): void {
  const ids = idList(element, attribute).filter((candidate) => candidate !== id);
  if (ids.length) element.setAttribute(attribute, ids.join(' '));
  else element.removeAttribute(attribute);
}

function idList(element: Element, attribute: string): string[] {
  return (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
}
