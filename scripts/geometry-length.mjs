/**
 * Resolves a `--gog-*` token to a **length in CSS pixels**, the way a browser would — the
 * companion to `token-color.mjs`, which does the same job for colour.
 *
 * ## Why this exists
 *
 * `styling.instructions.md` ("Geometry and typography are computed, not chosen") states five laws
 * about the lengths this library ships, and nothing could check any of them, because nothing could
 * read one. A padding is `var(--gog-space-14)`, which is `calc(14px * var(--gog-density))`, which
 * a theme may re-declare; a radius is `calc(var(--gog-radius) - 2px)`; a button's padding is a
 * *shorthand* holding two of them. None of that is a number until something resolves it.
 *
 * ## What it understands
 *
 * Exactly what this library's own `theme.css` writes, and nothing more:
 *
 * - `12px`, `0`, `1.5` (unitless — a line-height ratio, returned as-is with `unit: null`);
 * - `0.875rem`, at the CSS default of 16px per rem. **`em` resolves to `null`**, deliberately:
 *   its value depends on the element it lands on, so a number here would be a guess. The caller
 *   reports it as unresolved rather than pretending.
 * - `var(--x)` and `var(--x, fallback)`, followed through the same four layers `token-color.mjs`
 *   documents;
 * - `calc()` with `+ - * /` and nesting, `min()`, `max()`, `clamp()`;
 * - a two- or four-value shorthand (`--gog-button-md-padding: var(--gog-space-12)
 *   var(--gog-space-20)`), returned as `parts`.
 *
 * Anything else returns `null` **with the reason attached**. That is the one rule this file has:
 * `token-color.mjs` learned it the expensive way — a `color-mix()` percentage written as a token
 * made `gog-tag` resolve to nothing at all, and nine contrast pairs per theme were skipped in
 * silence for weeks. A checker that fails open is worse than no checker, so every `null` here
 * carries a `why` the caller is expected to print.
 *
 * ## Density
 *
 * Every step of the spacing scale is `calc(Npx * var(--gog-density))`, and nine of the eleven
 * themes set a density other than 1. Measurement happens at **`--gog-density: 1`** by default,
 * because that is what law 5 says: a compact theme is the consumer's decision and does not
 * license shipping a 22px control. Pass a different `density` to see a theme's own geometry.
 */

import { parseDecls } from './token-color.mjs';

const SIZES = ['xsm', 'sm', 'md', 'lg', 'slg'];

/** The size steps a component token may name, in order. */
export const SIZE_STEPS = SIZES;

/** Blanks comments while preserving offsets, so a commented-out example is never read as code. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * The declaration layers, in the order a browser resolves them. Same shape and same reasoning as
 * `token-color.mjs`'s `buildLayers` — repeated rather than imported because that one drops the
 * `@supports` block's *non-colour* declarations on the floor, and a length never appears there.
 */
export function buildLengthLayers(themeCssRaw) {
  const css = stripComments(themeCssRaw);
  const body = (re, from = 0) => {
    re.lastIndex = from;
    const m = re.exec(css);
    if (!m) return '';
    let depth = 0;
    const start = css.indexOf('{', m.index);
    for (let i = start; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) return css.slice(start + 1, i);
    }
    return '';
  };

  return {
    rootLiteral: parseDecls(body(/(^|\n):root\s*\{/g)),
    derivedBase: parseDecls(body(/(^|\n):root,\s*\n?\s*\[data-theme\]\s*\{/g)),
  };
}

/** `12px` → 12, `0.875rem` → 14, `1.5` → 1.5 (unitless), `1.2em` → null. */
function unitToPx(text) {
  const m = /^(-?\d*\.?\d+)(px|rem|em|%|)$/.exec(text.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (m[2] === 'px') return { px: n, unit: 'px' };
  if (m[2] === 'rem') return { px: n * 16, unit: 'rem' };
  if (m[2] === '') return { px: n, unit: null };
  return null; // em and % need an element to resolve against
}

/** Splits on top-level commas only, so `max(var(--a), 2px)` keeps its two arguments apart. */
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

/** Splits a shorthand on top-level whitespace: `var(--a) var(--b)` → two values. */
function splitSpace(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Evaluates the arithmetic inside a `calc()` body, once every `var()` is already substituted.
 *
 * Written as a shunting-yard rather than handed to `eval`: a token's value is text from a
 * stylesheet, and this script runs in CI. It is also why an unexpected character returns `null`
 * instead of throwing — the caller prints the raw value, which is more useful than a stack trace.
 */
function evalArithmetic(text) {
  const tokens = text.match(/\d*\.?\d+(?:px|rem|em|%)?|[()+\-*/]|\s+/g);
  if (!tokens) return null;

  const out = [];
  const ops = [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  let prev = null;

  for (const raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    if (/^\d/.test(t)) {
      const v = unitToPx(t);
      if (!v) return null;
      out.push(v.px);
    } else if (t === '(') {
      ops.push(t);
    } else if (t === ')') {
      while (ops.length && ops.at(-1) !== '(') out.push(ops.pop());
      if (!ops.length) return null;
      ops.pop();
    } else if (t in prec) {
      // A leading `-` is a sign, not an operator: `calc(-1px + 2px)`.
      if ((t === '-' || t === '+') && (prev === null || prev === '(' || prev in prec)) {
        if (t === '-') out.push(0);
        else continue;
      }
      while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t]) out.push(ops.pop());
      ops.push(t);
    } else return null;
    prev = t;
  }
  while (ops.length) {
    const op = ops.pop();
    if (op === '(') return null;
    out.push(op);
  }

  const stack = [];
  for (const t of out) {
    if (typeof t === 'number') stack.push(t);
    else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) return null;
      stack.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : a / b);
    }
  }
  return stack.length === 1 ? stack[0] : null;
}

/**
 * A resolver bound to one theme.
 *
 * `themeDecls` is that theme's own block — the palette plus whatever geometry it overrides, which
 * since 21.7.0's character layer is mostly `--gog-radius`, the border widths and `--gog-density`.
 */
export function makeLengthResolver(layers, themeDecls = new Map(), { density = 1 } = {}) {
  const lookup = (token) =>
    themeDecls.get(token) ??
    layers.derivedBase.get(token) ??
    layers.rootLiteral.get(token) ??
    null;

  /** Textual `var()` substitution, with cycle protection and fallbacks. */
  const expand = (text, seen) =>
    text.replace(
      /var\(\s*(--[a-z0-9-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/gi,
      (whole, name, fallback) => {
        if (name === '--gog-density') return String(density);
        if (seen.has(name)) return whole;
        const next = lookup(name) ?? (fallback === undefined ? null : fallback.trim());
        return next === null ? whole : expand(next, new Set([...seen, name]));
      },
    );

  /** One value (never a shorthand) → px, or null with a reason. */
  const value = (raw) => {
    if (raw === null || raw === undefined) return { px: null, why: 'not declared' };
    const expanded = expand(String(raw).trim(), new Set());

    if (/var\(/.test(expanded)) return { px: null, why: `unresolved var: ${expanded}` };
    if (/\bem\b|em[)\s]|\d+em/.test(expanded) && /\d+(\.\d+)?em/.test(expanded))
      return { px: null, why: `em depends on the element it lands on: ${expanded}` };

    const direct = unitToPx(expanded);
    if (direct) return { px: direct.px, unit: direct.unit, expanded };

    const fn = /^(calc|min|max|clamp)\((.*)\)$/is.exec(expanded);
    if (fn) {
      const name = fn[1].toLowerCase();
      const args = splitTop(fn[2]);
      if (name === 'calc') {
        const n = evalArithmetic(args.join(','));
        return n === null
          ? { px: null, why: `calc() this resolver cannot evaluate: ${expanded}` }
          : { px: n, unit: 'px', expanded };
      }
      const resolved = args.map((a) => value(a));
      if (resolved.some((r) => r.px === null))
        return { px: null, why: `${name}() with an unresolvable argument: ${expanded}` };
      const nums = resolved.map((r) => r.px);
      if (name === 'min') return { px: Math.min(...nums), unit: 'px', expanded };
      if (name === 'max') return { px: Math.max(...nums), unit: 'px', expanded };
      // clamp(min, preferred, max) — the preferred value is what a static resolver can report.
      return { px: nums[1] ?? null, unit: 'px', expanded, why: 'clamp(): preferred value' };
    }

    // A bare arithmetic expression with no calc() wrapper (`8px + 2px` never appears in this
    // library, but `0` and `999px` reach here through unitToPx above).
    const n = evalArithmetic(expanded);
    if (n !== null) return { px: n, unit: 'px', expanded };
    return { px: null, why: `not a length: ${expanded}` };
  };

  /**
   * A whole declaration, which may be a shorthand. `parts` holds one resolution per value, so a
   * caller reading `--gog-button-md-padding` gets `[y, x]` rather than a failure.
   */
  const declaration = (token) => {
    const raw = lookup(token);
    if (raw === null) return { token, px: null, parts: [], why: 'not declared' };
    const pieces = splitSpace(expand(raw.trim(), new Set()));
    const parts = pieces.map((p) => value(p));
    return { token, raw, px: parts.length === 1 ? parts[0].px : null, parts, why: parts[0]?.why };
  };

  return { lookup, value, declaration };
}

/**
 * Splits a token name into the block that owns it, the size step it names (if any) and the
 * property it sets. `--gog-button-md-padding` → `{ block: 'button', size: 'md', prop: 'padding' }`.
 *
 * The size may sit anywhere in the name, because three conventions coexist:
 * `--gog-button-<size>-padding`, `--gog-control-checkbox-box-size-<size>` and
 * `--gog-chip-<size>-padding-inline`. Normalising that here is the only reason the callers can
 * treat them as one thing — and the fact that it is needed at all is itself a finding.
 */
export function parseTokenName(token, propSuffixes) {
  const rest = token.slice('--gog-'.length);
  const segs = rest.split('-');

  let size = null;
  for (let i = 0; i < segs.length; i++) {
    if (SIZES.includes(segs[i])) {
      // `--gog-text-sm` is a scale step, not a sized component token: its block would be empty.
      if (i === 0) continue;
      size = segs[i];
      segs.splice(i, 1);
      break;
    }
  }

  const name = segs.join('-');
  for (const suffix of propSuffixes) {
    if (name === suffix) return { block: null, size, prop: suffix };
    if (name.endsWith('-' + suffix)) {
      return { block: name.slice(0, -(suffix.length + 1)), size, prop: suffix };
    }
  }
  return null;
}
