import { computed, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

// Mirrors every stylesheet the installed @guildofgleks/ui package ships from
// `styles/` (see the "docs/styles" asset glob in angular.json for the
// gleks-ui-lab build target), in the same order index.css imports them.
//
// Deliberately excludes `styles/presets/*`. Not because a preset is palette-only — since 21.7.0
// none of the nine is, and `material`/`primeng` do declare component tokens — but because a
// preset can only re-declare a name `theme.css` already has, so it contributes no *new* token to
// the list this feeds, while each extra file is one more request the generator waits on before it
// can render anything.
const STYLE_FILES = [
  'index.css',
  'theme.css',
  'typography.css',
  'utilities.css',
  'button.css',
  'fonts.css',
];

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
