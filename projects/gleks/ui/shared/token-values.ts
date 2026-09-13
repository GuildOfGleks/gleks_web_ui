/**
 * Reading a `--gog-*` token's value from TypeScript, safely.
 *
 * **The trap these exist for.** `getComputedStyle(el).getPropertyValue('--x')` returns a custom
 * property's *specified* value, not a used one. A token declared
 * `calc(10px * var(--gog-density))` comes back as that whole string, and `Number.parseFloat` on
 * it returns `NaN` — which every caller in this library turned into its fallback, silently. No
 * error, no failing test, just a component quietly using the wrong number.
 *
 * That is not hypothetical. 21.7.0's density scale (`docs/themes.md` iteration 6) made 178
 * tokens `calc(<n>px * var(--gog-density))`; none of the three tokens read from TypeScript were
 * among them, but nothing stopped the next one from being. And a **consumer** can write
 * `--gog-scroll-thumb-min-size: calc(2rem + 4px)` in their own theme at any time, which no
 * repo-side check could ever catch.
 *
 * So these resolve rather than parse: the fast path still handles a plain `12px`, and anything
 * else is handed to the browser on a throwaway element, which also gets `rem`, `em`, `%` and
 * nested `var()` right for free. The probe is appended to the element the token was read from,
 * so relative units resolve against the same context the real value would.
 */

/** Reads a length token in pixels. Returns `fallback` for an empty, unparseable or zero value. */
export function resolveLengthToken(el: HTMLElement, token: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  if (!raw) return fallback;

  const plain = PX.exec(raw);
  if (plain) return Number.parseFloat(plain[1]);

  return probe(el, `width:${raw}`, (style) => readPx(style.width), fallback);
}

/**
 * Reads a unitless numeric token (a `z-index`). Same resolution path as lengths — `z-index`
 * takes an integer, so the browser computes `calc()` there too.
 */
export function resolveNumberToken(el: HTMLElement, token: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  if (!raw) return fallback;

  const plain = NUMBER.exec(raw);
  if (plain) return Number.parseFloat(plain[1]);

  return probe(
    el,
    `position:relative;z-index:${raw}`,
    (s) => {
      const resolved = NUMBER.exec(s.zIndex.trim());
      return resolved ? Number.parseFloat(resolved[1]) : Number.NaN;
    },
    fallback,
  );
}

const PX = /^(-?\d*\.?\d+)px$/;
const NUMBER = /^(-?\d*\.?\d+)$/;

/**
 * A computed length, but only if it really was computed.
 *
 * An environment with no layout engine — jsdom, which is what this library's own unit tests run
 * in — hands back the *specified* string from `getComputedStyle`, so a probe styled `width: 2em`
 * reads back `"2em"`, and `parseFloat` would happily call that `2`. A wrong number is worse than
 * the fallback, so anything that is not a resolved pixel value is rejected.
 */
function readPx(value: string): number {
  const m = PX.exec(value.trim());
  return m ? Number.parseFloat(m[1]) : Number.NaN;
}

/**
 * Measures `declaration` on a hidden child of `host` and reads the result back.
 *
 * `visibility: hidden` rather than `display: none`, because a `display: none` element has no
 * used value to read — that is the whole failure this helper exists to avoid. `position:
 * absolute` keeps it out of the host's layout, so a flex or grid host is not disturbed by the
 * measurement.
 */
function probe(
  host: HTMLElement,
  declaration: string,
  read: (style: CSSStyleDeclaration) => number,
  fallback: number,
): number {
  const doc = host.ownerDocument;
  if (!doc?.defaultView) return fallback;

  const el = doc.createElement('div');
  el.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;${declaration}`;
  host.appendChild(el);
  let value: number;
  try {
    value = read(doc.defaultView.getComputedStyle(el));
  } finally {
    el.remove();
  }
  return Number.isFinite(value) ? value : fallback;
}
