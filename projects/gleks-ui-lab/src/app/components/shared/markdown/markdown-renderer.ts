import { Marked, type Tokens } from 'marked';
import { highlightCode } from '../code-highlight';
import { isLatestVersion } from '../library-version';

function renderCodeBlock({ text, lang }: Tokens.Code): string {
  const highlighted = highlightCode(text, lang);

  return `<div class="code-block">
    <div class="code-block__toolbar">
      <span class="code-block__lang">${lang || 'text'}</span>
      <button type="button" class="code-block__copy">Copy</button>
    </div>
    <pre><code class="hljs">${highlighted}</code></pre>
  </div>`;
}

/**
 * Exported because the FAQ page builds the same ids for its collapsible questions without going
 * through this renderer — those ids are linked to from elsewhere on the site, so the two have to
 * agree on how a heading becomes an anchor.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Reset per `renderMarkdown()` call so repeat headings ("Overview" in two
// different docs) don't leak dedupe state across unrelated renders.
let usedHeadingIds: Map<string, number>;

function uniqueHeadingId(base: string): string {
  const count = usedHeadingIds.get(base) ?? 0;
  usedHeadingIds.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

// The `On this page` TOC (see toc.ts) discovers sections by scanning the
// rendered page for `h2[id]` elements — headings need a real, GitHub-style
// slug id to be anchorable at all, which marked's default renderer omits.
function renderHeading(
  this: { parser: { parseInline(tokens: Tokens.Heading['tokens']): string } },
  { tokens, depth, text }: Tokens.Heading,
): string {
  const id = uniqueHeadingId(slugify(text));
  return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
}

const markedRenderer = new Marked({ renderer: { code: renderCodeBlock, heading: renderHeading } });

/**
 * The hand-written `since` chip inside `public/docs/*.md`, e.g.
 * `<span class="since" title="Added in 21.12.0">21.12.0</span>`. Marked passes inline HTML
 * straight through, so this is what reaches the page.
 */
const SINCE_CHIP_RE = /<span class="since"([^>]*)>(\d+\.\d+\.\d+)<\/span>/g;

/**
 * Fills in `since--latest` on the markdown chips that name the current release line.
 *
 * `<app-since>` computes that from the installed package and is always right. Its markdown twin
 * could not: the class had to be typed by hand, so it went stale on the next release, and once
 * the stale ones were removed the markdown half could no longer be filled **at all** — a
 * genuinely new API in `theming.md` or `global-config.md` simply never got the highlight the same
 * API gets one page over. Deriving it here fixes the class of bug rather than an instance, and
 * means a `.md` author writes the version and nothing else.
 */
function markLatestSinceChips(html: string): string {
  return html.replace(SINCE_CHIP_RE, (match, attrs: string, version: string) =>
    isLatestVersion(version)
      ? `<span class="since since--latest"${attrs}>${version}</span>`
      : match,
  );
}

export function renderMarkdown(markdown: string): string {
  usedHeadingIds = new Map();
  return markLatestSinceChips(markedRenderer.parse(markdown) as string);
}
