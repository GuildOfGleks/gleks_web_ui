import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogRippleDirective } from './ripple.directive';

@Component({
  imports: [GogRippleDirective],
  template: `
    <button gogRipple [rippleDisabled]="disabled()" [rippleCentred]="centred()" [disabled]="off()">
      Press me
    </button>
  `,
})
class RippleHost {
  readonly disabled = signal(false);
  readonly centred = signal(false);
  readonly off = signal(false);
}

/**
 * Geometry is not tested here and cannot be: jsdom does not lay out, so every
 * `getBoundingClientRect()` is a box of zeros and the radius maths always produces the same
 * answer. What a ripple looks like is verified in `ui-showcase`, in a browser, per the library's
 * definition of done. These specs cover the half jsdom *can* see — that a node appears, that it
 * leaves again, and that each of the four suppressions holds.
 */
describe('GogRippleDirective', () => {
  let fixture: ComponentFixture<RippleHost>;
  let host: RippleHost;

  function button(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button')!;
  }

  function layer(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.gog-ripple-layer');
  }

  function ripples(): HTMLElement[] {
    return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.gog-ripple')];
  }

  function press(init: MouseEventInit = {}): void {
    // jsdom ships no `PointerEvent`; a `MouseEvent` of the same type reaches the same listener
    // and carries the `clientX`/`clientY`/`button` the directive actually reads.
    button().dispatchEvent(new MouseEvent('pointerdown', { clientX: 12, clientY: 8, ...init }));
  }

  /**
   * On the document, not on the host: the directive listens for the release there, and only
   * while something is in flight — see `listenForRelease` for why.
   */
  function lift(type = 'pointerup'): void {
    document.dispatchEvent(new MouseEvent(type));
  }

  /** One animation cycle finishing on every live ripple node. */
  function finishAnimations(): void {
    for (const node of ripples()) node.dispatchEvent(new Event('animationend'));
  }

  function setReducedMotion(matches: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches, addEventListener: () => {}, removeEventListener: () => {} }),
    });
  }

  beforeEach(async () => {
    setReducedMotion(false);
    await TestBed.configureTestingModule({ imports: [RippleHost] }).compileComponents();
    fixture = TestBed.createComponent(RippleHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('marks the host as a containing block and renders nothing until it is pressed', () => {
    expect(button().classList).toContain('gog-ripple-host');
    expect(layer()).toBeNull();
    expect(ripples()).toHaveLength(0);
  });

  it('creates a ripple inside a self-clipping layer on pointerdown', () => {
    press();

    expect(layer()).not.toBeNull();
    expect(layer()!.getAttribute('aria-hidden')).toBe('true');
    expect(ripples()).toHaveLength(1);
    expect(ripples()[0].classList).toContain('gog-ripple--entering');
    expect(ripples()[0].parentElement).toBe(layer());
  });

  it('stacks concurrent ripples rather than replacing the one in flight', () => {
    press();
    press({ clientX: 40, clientY: 20 });

    expect(ripples()).toHaveLength(2);
  });

  it('fades out only once the expansion has finished, then removes the node', () => {
    press();
    lift();

    // Released mid-expansion: still entering, because cutting the wave short reads as a glitch.
    expect(ripples()[0].classList).toContain('gog-ripple--entering');

    finishAnimations();
    expect(ripples()[0].classList).toContain('gog-ripple--leaving');

    finishAnimations();
    expect(ripples()).toHaveLength(0);
  });

  it('holds the ripple while the pointer is still down', () => {
    press();
    finishAnimations();

    expect(ripples()[0].classList).toContain('gog-ripple--entering');

    lift();
    expect(ripples()[0].classList).toContain('gog-ripple--leaving');
  });

  it('releases on pointercancel, which is what a touch-drag-to-scroll sends', () => {
    press();
    finishAnimations();
    lift('pointercancel');

    expect(ripples()[0].classList).toContain('gog-ripple--leaving');
  });

  it('releases when the pointer comes up somewhere else on the page', () => {
    press();
    finishAnimations();
    // Pressed the button, dragged off, let go over the page. No `pointerup` ever reaches the
    // host, which is why the release listener is not on it.
    document.body.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));

    expect(ripples()[0].classList).toContain('gog-ripple--leaving');
  });

  it('centres a keyboard activation and does not stack one per auto-repeat', () => {
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true }));

    expect(ripples()).toHaveLength(1);

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    finishAnimations();
    finishAnimations();
    expect(ripples()).toHaveLength(0);
  });

  it('ignores keys that do not activate a control', () => {
    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

    expect(ripples()).toHaveLength(0);
  });

  it('ignores a secondary pointer button, which never produces a click', () => {
    press({ button: 2 });

    expect(ripples()).toHaveLength(0);
  });

  it('is suppressed by rippleDisabled', async () => {
    host.disabled.set(true);
    await fixture.whenStable();

    press();
    expect(ripples()).toHaveLength(0);
  });

  it('detaches its listeners while rippleDisabled, rather than merely ignoring events', async () => {
    // The whole reason `GOG_CONFIG.ripple.enabled` is a config key and not a
    // `--gog-ripple-opacity: 0` token: a component that wires the ripple in behind an input that
    // is off must not pay for it. Asserted through behaviour, since the listeners themselves are
    // not observable — a press taken while disabled must still produce nothing after re-enabling.
    host.disabled.set(true);
    await fixture.whenStable();
    press();

    host.disabled.set(false);
    await fixture.whenStable();
    expect(ripples()).toHaveLength(0);

    press();
    expect(ripples()).toHaveLength(1);
  });

  it('lets go of a ripple already in flight when it is disabled mid-press', async () => {
    press();
    finishAnimations();
    expect(ripples()[0].classList).toContain('gog-ripple--entering');

    host.disabled.set(true);
    await fixture.whenStable();

    expect(ripples()[0].classList).toContain('gog-ripple--leaving');
  });

  it('is suppressed on a disabled host', async () => {
    host.off.set(true);
    await fixture.whenStable();

    press();
    expect(ripples()).toHaveLength(0);
  });

  it('is suppressed on an aria-disabled host', () => {
    button().setAttribute('aria-disabled', 'true');

    press();
    expect(ripples()).toHaveLength(0);
  });

  it('is suppressed entirely under prefers-reduced-motion, not merely shortened', () => {
    setReducedMotion(true);

    press();
    expect(ripples()).toHaveLength(0);
    expect(layer()).toBeNull();
  });

  it('takes the layer and every live ripple with it when the host is destroyed', () => {
    press();
    // Held onto deliberately: `fixture.destroy()` detaches the button, and the layer is not part
    // of any Angular view, so only the element itself can say whether the directive cleaned up.
    const detached = button();
    expect(detached.querySelector('.gog-ripple-layer')).not.toBeNull();

    fixture.destroy();

    expect(detached.querySelector('.gog-ripple-layer')).toBeNull();
    expect(detached.querySelector('.gog-ripple')).toBeNull();
  });
});
