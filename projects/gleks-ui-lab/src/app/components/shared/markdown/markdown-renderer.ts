import { Marked, type Tokens } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);

function renderCodeBlock({ text, lang }: Tokens.Code): string {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value;

  return `<div class="code-block">
    <div class="code-block__toolbar">
      <span class="code-block__lang">${language ?? 'text'}</span>
      <button type="button" class="code-block__copy">Copy</button>
    </div>
    <pre><code class="hljs">${highlighted}</code></pre>
  </div>`;
}

function slugify(text: string): string {
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
function renderHeading(this: { parser: { parseInline(tokens: Tokens.Heading['tokens']): string } }, {
  tokens,
  depth,
  text,
}: Tokens.Heading): string {
  const id = uniqueHeadingId(slugify(text));
  return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
}

const markedRenderer = new Marked({ renderer: { code: renderCodeBlock, heading: renderHeading } });

export function renderMarkdown(markdown: string): string {
  usedHeadingIds = new Map();
  return markedRenderer.parse(markdown) as string;
}
