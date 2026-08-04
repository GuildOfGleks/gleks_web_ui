import { InjectionToken } from '@angular/core';

import { GogScrollOverscrollBehavior } from '../../shared/types';

/**
 * App-wide default for `gog-scroll`'s `overscrollBehavior` input, for consumers who want
 * every instance that doesn't set the input explicitly to behave one way — e.g. an app built
 * mostly out of overlay-style panels might provide `'contain'` here once instead of setting
 * `overscrollBehavior="contain"` on every `gog-scroll` in the app:
 *
 * ```ts
 * providers: [{ provide: GOG_SCROLL_DEFAULT_OVERSCROLL_BEHAVIOR, useValue: 'contain' }]
 * ```
 *
 * A single instance's own `overscrollBehavior` input still wins over this when set.
 */
export const GOG_SCROLL_DEFAULT_OVERSCROLL_BEHAVIOR = new InjectionToken<GogScrollOverscrollBehavior>(
  'GOG_SCROLL_DEFAULT_OVERSCROLL_BEHAVIOR',
  { providedIn: 'root', factory: () => 'auto' },
);
