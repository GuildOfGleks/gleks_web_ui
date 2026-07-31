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

const markedRenderer = new Marked({ renderer: { code: renderCodeBlock } });

export function renderMarkdown(markdown: string): string {
  return markedRenderer.parse(markdown) as string;
}
