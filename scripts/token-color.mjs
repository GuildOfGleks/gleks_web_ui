/**
 * Resolves a `--gog-*` token to an actual colour, for one theme, the way a browser would.
 *
 * ## Why this exists
 *
 * `check-contrast.mjs` compared **palette** tokens only — `#hex` against `#hex`, straight out of a
 * theme block. That covers the foundation, and it is blind to every pair where one side is a
 * *component* token whose value is a `color-mix()` wash: the wash has no colour until it is
 * composited over whatever it sits on, so there is nothing to look up.
 *
 * Two real failures got through that gap and were found by hand instead:
 *
 * - the outline button's hover label, which failed WCAG AA in **all 11** shipped themes
 *   (21.9.0); and
 * - the ghost button's hover label, under AA in three themes, where the label is the accent and
 *   the hover tints the ground with the same accent, so the two walk toward each other.
 *
 * Both are labels on a ground the palette does not state. Eight more surfaces took on the same
 * shape in 21.9.0 when their press states became washes. Hand-verification found all of it and
 * will not survive the next theme, which is the argument for this file.
 *
 * ## What it understands
 *
 * Enough of CSS colour syntax to resolve what this library's own theme file actually writes, and
 * nothing more: `#hex`, `transparent`, `var(--x)` with an optional fallback, and
 * `color-mix(in srgb, <colour> N%, <colour>)`. Anything else resolves to `null`, which the caller
 * reports rather than guesses at — a token that quietly resolved to the wrong colour would be
 * worse than one that says it cannot.
 *
 * ## The layers, in the order a browser resolves them
 *
 * 1. the theme's own block (`[data-theme='dark']`, or a preset file) — palette literals, and any
 *    component token that theme overrides;
 * 2. the `@supports (color: color-mix(…))` block's `:root, [data-theme]` — the mixed values,
 *    which win in every browser that supports the function;
 * 3. the plain `:root, [data-theme]` block — the derived layer, and the flat fallbacks the
 *    `@supports` block overrides;
 * 4. the plain `:root` block — literals.
 *
 * That order is the file's own design (see theme.css's header) rather than a guess, and it is why
 * a wash resolves to its mixed value here: that is what a supporting browser paints.
 */

/** Blanks comments while preserving offsets, so a commented-out example is never read as code. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** `--name: value;` pairs out of one block body. Values may contain commas and parentheses. */
export function parseDecls(body) {
  const decls = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(body))) decls.set(m[1], m[2].trim());
  return decls;
}

/** The body of the first block whose selector matches `selectorRe`, brace-matched. */
function blockBody(css, selectorRe, fromIndex = 0) {
  selectorRe.lastIndex = fromIndex;
  const hit = selectorRe.exec(css);
  if (!hit) return null;
  const open = css.indexOf('{', hit.index + hit[0].length - 1);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return { body: css.slice(open + 1, i), end: i };
    }
  }
  return null;
}

/**
 * The three theme-independent layers of `theme.css`, as declaration maps.
 *
 * `derivedSupports` is read from inside the `@supports` block, so a token declared both flat and
 * mixed resolves to the mixed value — what a supporting browser paints, and the one this check
 * should be measuring.
 */
export function buildLayers(themeCssRaw) {
  const css = stripComments(themeCssRaw);

  const rootOnly = blockBody(css, /(^|\n):root\s*\{/g);
  const derived = blockBody(css, /(^|\n):root,\s*\n?\s*\[data-theme\]\s*\{/g);

  const supportsAt = css.search(/@supports\s*\([^)]*color-mix/);
  const supportsBlock =
    supportsAt === -1 ? null : blockBody(css, /:root,\s*\n?\s*\[data-theme\]\s*\{/g, supportsAt);

  return {
    rootLiteral: parseDecls(rootOnly?.body ?? ''),
    derivedBase: parseDecls(derived?.body ?? ''),
    derivedSupports: parseDecls(supportsBlock?.body ?? ''),
  };
}

/** Splits on top-level commas only, so `color-mix(in srgb, var(--a), b)` stays one argument. */
function splitTop(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function hexToRgba(hex) {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 || h.length === 4
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const num = parseInt(full.slice(0, 6), 16);
  const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: alpha };
}

/**
 * A resolver bound to one theme. `themeDecls` is that theme's own block (palette plus whatever
 * component tokens it overrides); everything else comes from the shared layers.
 */
export function makeResolver(layers, themeDecls) {
  const lookup = (token) =>
    themeDecls.get(token) ??
    layers.derivedSupports.get(token) ??
    layers.derivedBase.get(token) ??
    layers.rootLiteral.get(token) ??
    null;

  const parse = (value, seen) => {
    if (value === null) return null;
    const v = value.trim();

    if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    if (v.startsWith('#')) return hexToRgba(v);

    if (v.startsWith('var(')) {
      const inner = v.slice(4, v.lastIndexOf(')'));
      const [tokenName, ...rest] = splitTop(inner);
      if (seen.has(tokenName)) return null; // a cycle is a bug in the theme, not a colour
      const next = lookup(tokenName);
      if (next !== null) return parse(next, new Set([...seen, tokenName]));
      return rest.length > 0 ? parse(rest.join(','), seen) : null;
    }

    if (v.startsWith('color-mix(')) {
      const args = splitTop(v.slice(10, v.lastIndexOf(')')));
      if (args.length !== 3 || !/^in\s+srgb$/.test(args[0])) return null;
      const read = (arg) => {
        const pct = arg.match(/([\d.]+)%\s*$/);
        const colour = parse(pct ? arg.slice(0, pct.index).trim() : arg, seen);
        return colour === null ? null : { colour, weight: pct ? Number(pct[1]) / 100 : null };
      };
      const first = read(args[1]);
      const second = read(args[2]);
      if (!first || !second) return null;
      // CSS lets either side carry the percentage; the other is the remainder.
      const w1 = first.weight ?? (second.weight === null ? 0.5 : 1 - second.weight);
      const w2 = 1 - w1;
      const a = first.colour.a * w1 + second.colour.a * w2;
      // Premultiplied, which is what `color-mix` does — mixing 24% amber into `transparent`
      // must stay amber at 24% alpha, not amber dragged toward black.
      const mix = (ch) =>
        a === 0
          ? 0
          : (first.colour[ch] * first.colour.a * w1 + second.colour[ch] * second.colour.a * w2) / a;
      return { r: mix('r'), g: mix('g'), b: mix('b'), a };
    }

    return null;
  };

  /**
   * Takes a token name (`--gog-x`) or a whole declaration value
   * (`var(--gog-x, var(--gog-y))`). The second form matters: this library deliberately leaves
   * some tokens undeclared as per-instance escape hatches — `--gog-button-toggle-color` and
   * friends — and the real default lives in the *rule's* fallback, not in the token. Resolving
   * the value rather than the name is what makes those states checkable instead of skipped.
   */
  return (tokenOrValue) =>
    tokenOrValue.startsWith('--')
      ? parse(lookup(tokenOrValue), new Set([tokenOrValue]))
      : parse(tokenOrValue, new Set());
}

/** Paints `fg` over the opaque `bg`. */
export function over(fg, bg) {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast between two **opaque** colours. Composite anything translucent first. */
export function contrast(a, b) {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

export function toHex({ r, g, b }) {
  const part = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}
