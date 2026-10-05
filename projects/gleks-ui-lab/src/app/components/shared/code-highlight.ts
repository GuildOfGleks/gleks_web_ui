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
  // Plain text — a console message, say — is not code, and auto-detection would colour its words
  // as keywords.
  if (lang === 'text') {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  return language ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
}
