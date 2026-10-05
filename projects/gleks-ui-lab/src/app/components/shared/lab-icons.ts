import { provideGogIcons } from '@guildofgleks/ui';

/** Lucide's own attributes, so a registered glyph draws exactly like a built-in one. */
const lucide = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

/**
 * The few glyphs this site needs that are not among the library's built-ins, registered the way
 * the Icon page tells a consumer to. They are Lucide, like the built-ins (ISC licence, the notice
 * ships in the package). The site drew its header and overview with FontAwesome until 21.19.0,
 * which put 102 kB of it in the initial bundle for seven icons.
 */
export function provideLabIcons() {
  return provideGogIcons({
    palette: lucide(
      '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
    ),
    droplet: lucide(
      '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    ),
    'droplet-off': lucide(
      '<path d="M18.715 13.186C18.29 11.858 17.384 10.607 16 9.5c-2-1.6-3.5-4-4-6.5a10.7 10.7 0 0 1-.884 2.586"/><path d="m2 2 20 20"/><path d="M8.795 8.797A11 11 0 0 1 8 9.5C6 11.1 5 13 5 15a7 7 0 0 0 13.222 3.208"/>',
    ),
    'align-left': lucide('<path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/>'),
    'align-right': lucide('<path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/>'),
    contrast: lucide(
      '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z" fill="currentColor"/>',
    ),
    accessibility: lucide(
      '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
    ),
  });
}
