import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CollapsibleComponent } from './collapsible.component';

/**
 * Marks the element that a `gog-collapsible` shows and hides. Applies the open/closed
 * CSS state and the ARIA wiring (`id`, `aria-hidden`, `inert`) to whatever element this is
 * placed on — that element owns its own content and layout.
 */
@Directive({
  selector: '[gogCollapsibleContent]',
  host: {
    class: 'gog-collapsible__content',
    '[class.gog-collapsible__content--open]': 'collapsible.open()',
    '[class.gog-collapsible__content--settled]': 'settled()',
    '[id]': 'collapsible.contentId()',
    '[attr.aria-hidden]': '!collapsible.open()',
    '[attr.inert]': '!collapsible.open() ? "" : null',
  },
})
export class GogCollapsibleContentDirective {
  protected readonly collapsible = inject(CollapsibleComponent);

  /**
   * Open, finished animating, and not capped. The height animation needs `overflow: hidden`, and
   * kept once open it clipped a dropdown or a menu opened inside the content at the content's
   * edge. A `--gog-collapsible-max-height` set to a length is a deliberate cap that clips, so a
   * computed `max-height` other than `max-content` or `none` never settles.
   */
  protected readonly settled = signal(false);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancel = () => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };
    inject(DestroyRef).onDestroy(cancel);

    effect(() => {
      const open = this.collapsible.open();
      untracked(() => {
        cancel();
        this.settled.set(false);
        if (!open || !isBrowser) return;
        // The longest transition on the element, so opacity finishing last is waited for too.
        const style = getComputedStyle(element);
        const wait = Math.max(0, ...style.transitionDuration.split(',').map(toMs));
        timer = setTimeout(() => {
          timer = null;
          const cap = getComputedStyle(element).maxHeight;
          if (cap === 'none' || cap === 'max-content' || cap === '') this.settled.set(true);
        }, wait);
      });
    });
  }
}

/** `'0.2s'` → 200, `'150ms'` → 150. */
function toMs(duration: string): number {
  const value = Number.parseFloat(duration);
  if (!Number.isFinite(value)) return 0;
  return duration.trim().endsWith('ms') ? value : value * 1000;
}
