// Shared by scripts/check-tokens.mjs, scripts/check-deprecations.mjs and
// scripts/generate-deprecations.mjs.
/**
 * Everything the library currently deprecates, and how to read it out of the source.
 *
 * Two kinds live here because the library deprecates two kinds of thing, and they are announced
 * differently:
 *
 *   - **TypeScript symbols** carry a `@deprecated since <version> (<date>) — <replacement>.
 *     Removed in <version>.` tag, parsed straight out of the source. As of 21.5.0 there are
 *     none: iteration 3 removed all sixteen. That is the healthy state, not a bug in the parser.
 *   - **CSS custom properties** cannot carry a tag a tool can attach to a name — a token is a
 *     string in a stylesheet, not a declaration a compiler sees. The three abbreviated prefixes
 *     are therefore described here, once, and expanded against the real stylesheets: whatever
 *     `var(--gog-btn-…, …)` the CSS actually contains is what lands in the manifest, so the list
 *     cannot drift from the code the way a hand-kept one would.
 */

/**
 * The abbreviated prefixes that predate `api-design.instructions.md`'s naming rule. Each still
 * resolves — theme.css declares the spelled-out name and puts the old one in its fallback — and
 * each goes in 21.7.0.
 *
 * **Nothing may be added here.** It is a countdown, not an escape hatch: a new token uses the
 * component's spelled-out name, which is what `check-tokens.mjs`'s rule E enforces.
 */
export const DEPRECATED_NAMESPACES = new Map([
  [
    'btn',
    {
      replacementPrefix: '--gog-button-',
      since: '21.5.0',
      sinceDate: '2026-08-19',
      removedIn: '21.7.0',
    },
  ],
  [
    'ms',
    {
      replacementPrefix: '--gog-multiselect-',
      since: '21.3.0',
      sinceDate: '2026-08-07',
      removedIn: '21.7.0',
    },
  ],
  [
    'confirm',
    {
      replacementPrefix: '--gog-confirmation-dialog-',
      since: '21.5.0',
      sinceDate: '2026-08-19',
      removedIn: '21.7.0',
    },
  ],
]);

/** `since <version> (<date>) — <replacement>. Removed in <version>.` */
const TAG_HEAD_RE = /^since\s+(\d+\.\d+\.\d+)\s+\((\d{4}-\d{2}-\d{2})\)\s+—\s+(.+)$/s;
const REMOVAL_RE = /Removed in\s+(\d+\.\d+\.\d+)\./;

export function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Reads a tag's text starting at the line holding `@deprecated`.
 *
 * A tag runs to the end of its own paragraph, not to the end of the comment: several blocks in
 * this library continue with migration prose after the tag, and one put the tag in a `//` comment
 * inside a decorator. So collection stops at the next JSDoc tag, a blank comment line, the end of
 * the block, or the first line that is not a comment at all.
 */
export function readTag(lines, startIndex) {
  const parts = [];
  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i];
    const isBlockLine = /^\s*\*/.test(raw);
    const isLineComment = /^\s*\/\//.test(raw);
    if (i > startIndex && !isBlockLine && !isLineComment) break;

    let text = raw
      .replace(/^\s*\/\*+/, '')
      .replace(/^\s*\/\//, '')
      .replace(/^\s*\*(?!\/)/, '')
      .replace(/\*\/\s*$/, '')
      .trim();

    if (i === startIndex) {
      text = text.slice(text.indexOf('@deprecated') + '@deprecated'.length).trim();
    } else if (text === '' || text.startsWith('@')) {
      break;
    }

    parts.push(text);
    if (/\*\/\s*$/.test(raw)) break;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Splits a tag's text into its four required parts, or explains which one is missing.
 *
 * Returns `{ ok: true, tag }` or `{ ok: false, problem }` — both callers need the failure text,
 * and keeping it here is what makes the check and the generator agree on what a valid tag is.
 */
export function parseTag(text) {
  const head = TAG_HEAD_RE.exec(text);
  if (!head) {
    return {
      ok: false,
      problem:
        '@deprecated ' +
        text +
        '\n      does not match `@deprecated since <version> (<YYYY-MM-DD>) — <replacement>. Removed in <version>.`',
    };
  }

  const [, since, sinceDate, rest] = head;
  const removal = REMOVAL_RE.exec(rest);
  if (!removal) {
    return {
      ok: false,
      problem:
        'no `Removed in <version>.` — a deprecation without a removal version never comes due',
    };
  }

  const replacement = rest.slice(0, removal.index).trim();
  if (replacement === '') {
    return { ok: false, problem: 'names no replacement between the date and the removal version' };
  }

  const removedIn = removal[1];
  if (compareVersions(removedIn, since) <= 0) {
    return {
      ok: false,
      problem: `removal version ${removedIn} is not after the deprecation version ${since}`,
    };
  }

  return { ok: true, tag: { since, sinceDate, replacement, removedIn } };
}

/** The first line of real code after a tag — enough to name what the tag is on. */
export function readContext(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw === '' || raw.startsWith('*') || raw.startsWith('//') || raw.startsWith('/*')) {
      continue;
    }
    return raw.length > 90 ? `${raw.slice(0, 87)}…` : raw;
  }
  return '';
}

/**
 * Every deprecated token spelling the given stylesheets actually contain, paired with the name
 * that replaced it.
 *
 * Read out of the CSS rather than listed: theme.css writes each deprecated name inside its
 * replacement's fallback (`--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem)`)
 * and button.css keeps the instance-layer ones in its var() chains, so scanning for them finds
 * exactly the set that still resolves — no more, and none missed.
 */
export function collectDeprecatedTokens(sources) {
  const found = new Map();

  for (const css of sources) {
    for (const match of css.matchAll(/--gog-([a-zA-Z0-9-]+)/g)) {
      const rest = match[1];
      for (const [short, meta] of DEPRECATED_NAMESPACES) {
        if (!rest.startsWith(`${short}-`)) continue;
        const suffix = rest.slice(short.length + 1);
        // A bare `--gog-btn-` with nothing after it never resolves anything — it only shows up
        // here because prose like `` `--gog-btn-*` `` in a comment matches the same regex up to
        // the `*`, which isn't a CSS identifier character. Not a real deprecated token.
        if (suffix.length === 0) continue;

        const name = `--gog-${rest}`;
        found.set(name, {
          kind: 'token',
          name,
          replacement: `${meta.replacementPrefix}${suffix}`,
          since: meta.since,
          sinceDate: meta.sinceDate,
          removedIn: meta.removedIn,
        });
      }
    }
  }

  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}
