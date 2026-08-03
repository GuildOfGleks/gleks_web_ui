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

export function highlightCode(code: string, lang?: string): string {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  return language ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
}
