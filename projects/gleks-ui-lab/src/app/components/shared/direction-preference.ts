import { Injectable, Signal, signal } from '@angular/core';

/**
 * Whether the docs are being read right-to-left — the header's direction toggle.
 *
 * A service rather than a signal passed between components, because the two halves are far apart:
 * the toggle lives in the header, and the attribute it drives is on `.content-container` in the
 * app shell. Threading an input and an output through for one boolean would put the header in
 * charge of something it does not own.
 *
 * **The scope is deliberate and is the point of the feature.** `dir` goes on the content column,
 * never on `<html>`: the library mirrors through logical CSS properties, but this site's own
 * chrome — header, both sidebars — is written with physical left/right, so flipping the document
 * would break the frame instead of demonstrating the library. The Right-to-left doc page's own
 * demo makes the same choice on a smaller region.
 *
 * Not persisted, unlike {@link RipplePreference}: a reader flips this to look at one page, and
 * finding the site mirrored on a later visit would be a surprise rather than a preference.
 */
@Injectable({ providedIn: 'root' })
export class DirectionPreference {
  private readonly state = signal(false);

  readonly isRtl: Signal<boolean> = this.state.asReadonly();

  toggle(): void {
    this.state.update((rtl) => !rtl);
  }
}
