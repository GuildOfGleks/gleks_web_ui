import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AlertComponent } from '@guildofgleks/ui';

const STORAGE_KEY = 'gog-lab-reduced-motion-notice';
const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Says so when the reader's system asks for reduced motion — Windows' "Animation effects" off,
 * macOS/iOS "Reduce motion", GNOME's animations switch, Android's "Remove animations", or
 * Firefox's own `ui.prefersReducedMotion`. The library honours that setting, so every demo here
 * shows its reduced version, and a reader comparing a page's prose to what they see deserves to
 * know why the two differ.
 *
 * Read in the browser only, after the first render: the server cannot know the setting, and
 * rendering the notice there would mismatch on hydration for everyone without it. It follows the
 * setting live (`change`), and once dismissed it stays dismissed on this device.
 */
@Component({
  selector: 'app-reduced-motion-notice',
  imports: [AlertComponent],
  templateUrl: './reduced-motion-notice.html',
  styleUrl: './reduced-motion-notice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReducedMotionNotice {
  private readonly reduced = signal(false);
  private readonly dismissedHere = signal(true);

  protected readonly visible = computed(() => this.reduced() && !this.dismissedHere());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.dismissedHere.set(readDismissed());
      const media = window.matchMedia(QUERY);
      this.reduced.set(media.matches);
      const onChange = (event: MediaQueryListEvent) => this.reduced.set(event.matches);
      media.addEventListener('change', onChange);
      destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
    });
  }

  protected dismiss(): void {
    this.dismissedHere.set(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Private mode, or storage disabled entirely. Dismissed for this session only.
    }
  }
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
