import { computed, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

// Mirrors every stylesheet the installed @guildofgleks/ui package ships from
// `src/styles/` (see the "docs/styles" asset glob in angular.json for the
// gleks-ui-lab build target), in the same order index.css imports them.
const STYLE_FILES = ['index.css', 'theme.css', 'typography.css', 'utilities.css', 'fonts.css'];

export function injectFullLibraryCss(): Signal<string | undefined> {
  const resources = STYLE_FILES.map((name) => ({
    name,
    resource: httpResource.text(() => `/docs/styles/${name}`),
  }));

  return computed(() => {
    const contents = resources.map(({ name, resource }) => ({ name, content: resource.value() }));
    if (contents.some(({ content }) => content === undefined)) return undefined;

    return contents
      .map(({ name, content }) => `/* ==== ${name} ==== */\n\n${content}`)
      .join('\n\n');
  });
}
