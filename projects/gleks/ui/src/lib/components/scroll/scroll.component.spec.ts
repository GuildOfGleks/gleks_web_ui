import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ScrollComponent } from './scroll.component';
import { GOG_CONFIG } from '../../shared/config';

/** jsdom never lays elements out, so scroll/client metrics are stubbed per test as needed. */
function mockMetrics(
  el: HTMLElement,
  metrics: Partial<{
    scrollHeight: number;
    clientHeight: number;
    scrollWidth: number;
    clientWidth: number;
  }>,
): void {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(el, key, { value, configurable: true });
  }
}

/**
 * Waits for the component's coalesced measurement to land.
 *
 * `ScrollComponent.scheduleMeasure()` collapses a burst of scroll/resize events into one
 * `requestAnimationFrame`. A test that dispatches a scroll and then awaits a *single* frame is
 * racing: `dispatchScroll()` schedules frame A immediately, and if A fires while
 * `whenStable()` is still awaiting, the effect that also calls `scheduleMeasure()` can register
 * a second frame B — after the test's own frame, so the assertion runs before the measurement.
 * Two frames cover both orderings. This was an intermittent failure in the overscroll specs.
 */
async function settleMeasure(fixture: { whenStable(): Promise<unknown> }): Promise<void> {
  await fixture.whenStable();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('ScrollComponent', () => {
  let component: ScrollComponent;
  let fixture: ComponentFixture<ScrollComponent>;
  let viewport: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();

    viewport = fixture.nativeElement.querySelector('.gog-scroll__viewport') as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * The custom scrollbar's pointer surface — paging by clicking the track, and dragging the
   * thumb. Both are why this component exists rather than `overflow: auto`, and neither was
   * covered before 21.5.0's test-depth pass: the audit counted 23 tests and no pointer ones.
   *
   * jsdom lays nothing out, so the geometry is stubbed: `mockMetrics` for the viewport's own
   * scroll/client sizes, and a fixed rect on the track. The track only renders once a measure
   * has found an overflow, so every case measures first and queries afterwards.
   */
  describe('the scrollbar as a pointer surface', () => {
    /** 100px of viewport over 400px of content, with a 100px-tall track at the top. */
    async function overflowing(): Promise<{
      track: HTMLElement;
      thumb: HTMLElement;
      scrollBy: ReturnType<typeof vi.fn>;
    }> {
      mockMetrics(viewport, { scrollHeight: 400, clientHeight: 100 });
      viewport.dispatchEvent(new Event('scroll'));
      await settleMeasure(fixture);
      fixture.detectChanges();

      const track = fixture.nativeElement.querySelector('.gog-scroll__track--v') as HTMLElement;
      const thumb = fixture.nativeElement.querySelector('.gog-scroll__thumb--v') as HTMLElement;
      const scrollBy = vi.fn();
      viewport.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];

      for (const el of [track, thumb]) {
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
          top: 0,
          bottom: 100,
          height: 100,
          left: 0,
          right: 10,
          width: 10,
          x: 0,
          y: 0,
          toJSON: () => '',
        } as DOMRect);
      }
      thumb.setPointerCapture = vi.fn();
      thumb.releasePointerCapture = vi.fn();
      thumb.hasPointerCapture = vi.fn().mockReturnValue(true);
      // The drag maths reads the track's own layout height, which jsdom reports as 0 — that
      // would divide the pointer delta by zero and move the viewport nowhere.
      mockMetrics(track, { clientHeight: 100 });

      return { track, thumb, scrollBy };
    }

    function pointer(type: string, init: MouseEventInit): Event {
      return new MouseEvent(type, { bubbles: true, ...init });
    }

    it('renders a vertical track once the content overflows', async () => {
      const { track, thumb } = await overflowing();
      expect(track).toBeTruthy();
      expect(thumb).toBeTruthy();
    });

    it('pages down when the track is clicked below the thumb', async () => {
      const { track, scrollBy } = await overflowing();

      track.dispatchEvent(pointer('pointerdown', { clientY: 95, clientX: 5 }));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      const [{ top, behavior }] = scrollBy.mock.calls[0] as [ScrollToOptions];
      expect(top).toBeGreaterThan(0);
      expect(behavior).toBe('smooth');
    });

    it('pages up when the track is clicked above the thumb', async () => {
      const { track, scrollBy } = await overflowing();
      viewport.scrollTop = 300;
      viewport.dispatchEvent(new Event('scroll'));
      await settleMeasure(fixture);

      track.dispatchEvent(pointer('pointerdown', { clientY: 2, clientX: 5 }));

      const [{ top }] = scrollBy.mock.calls[0] as [ScrollToOptions];
      expect(top).toBeLessThan(0);
    });

    it('ignores a track pointerdown that actually landed on the thumb', async () => {
      const { thumb, scrollBy } = await overflowing();

      thumb.dispatchEvent(pointer('pointerdown', { clientY: 10, clientX: 5 }));

      expect(scrollBy).not.toHaveBeenCalled();
    });

    it('drags the thumb, and stops tracking the pointer once it is released', async () => {
      const { thumb } = await overflowing();

      thumb.dispatchEvent(pointer('pointerdown', { clientY: 10, clientX: 5 }));
      await fixture.whenStable();
      expect(component['dragAxis']()).toBe('vertical');

      thumb.dispatchEvent(pointer('pointermove', { clientY: 40, clientX: 5 }));
      expect(viewport.scrollTop).toBeGreaterThan(0);

      const scrolledTo = viewport.scrollTop;
      thumb.dispatchEvent(pointer('pointerup', { clientY: 40, clientX: 5 }));
      await fixture.whenStable();
      expect(component['dragAxis']()).toBeNull();

      // A move after release must not keep scrolling the viewport.
      thumb.dispatchEvent(pointer('pointermove', { clientY: 90, clientX: 5 }));
      expect(viewport.scrollTop).toBe(scrolledTo);
    });

    it('keeps the scrollbar visible for as long as the drag lasts', async () => {
      const { thumb } = await overflowing();

      thumb.dispatchEvent(pointer('pointerdown', { clientY: 10, clientX: 5 }));
      await fixture.whenStable();
      expect(component['interacting']()).toBe(true);
      expect(component['dragAxis']()).toBe('vertical');

      thumb.dispatchEvent(pointer('pointerup', { clientY: 10, clientX: 5 }));
      await fixture.whenStable();
      expect(component['dragAxis']()).toBeNull();
    });
  });
  it('defaults to a vertical, non-thin, auto-hiding, focusable viewport', () => {
    expect(component.axis()).toBe('vertical');
    expect(component.size()).toBeUndefined();
    expect(component['resolvedSize']()).toBe('normal');
    expect(component.autoHide()).toBeUndefined();
    expect(component['resolvedAutoHide']()).toBe(true);
    expect(component.focusable()).toBe(true);
    expect(viewport.getAttribute('tabindex')).toBe('0');
    expect(viewport.getAttribute('role')).toBe('region');
  });

  it('drops tabindex/role when focusable is false', async () => {
    fixture.componentRef.setInput('focusable', false);
    await fixture.whenStable();

    expect(viewport.getAttribute('tabindex')).toBeNull();
    expect(viewport.getAttribute('role')).toBeNull();
  });

  it('sets aria-label only while focusable', async () => {
    fixture.componentRef.setInput('ariaLabel', 'Message list');
    await fixture.whenStable();
    expect(viewport.getAttribute('aria-label')).toBe('Message list');

    fixture.componentRef.setInput('focusable', false);
    await fixture.whenStable();
    expect(viewport.getAttribute('aria-label')).toBeNull();
  });

  it('projects content into the viewport', async () => {
    @Component({
      imports: [ScrollComponent],
      template: `<gog-scroll><p class="projected">Hello</p></gog-scroll>`,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.gog-scroll__content .projected')).toBeTruthy();
  });

  describe('axis classes', () => {
    it('enables only the vertical viewport axis by default', () => {
      const root = fixture.nativeElement.querySelector('.gog-scroll') as HTMLElement;
      expect(root.classList.contains('gog-scroll--v')).toBe(true);
      expect(root.classList.contains('gog-scroll--h')).toBe(false);
    });

    it('enables only the horizontal axis when axis is horizontal', async () => {
      fixture.componentRef.setInput('axis', 'horizontal');
      await fixture.whenStable();

      const root = fixture.nativeElement.querySelector('.gog-scroll') as HTMLElement;
      expect(root.classList.contains('gog-scroll--v')).toBe(false);
      expect(root.classList.contains('gog-scroll--h')).toBe(true);
    });

    it('enables both axes and the --both modifier when axis is both', async () => {
      fixture.componentRef.setInput('axis', 'both');
      await fixture.whenStable();

      const root = fixture.nativeElement.querySelector('.gog-scroll') as HTMLElement;
      expect(root.classList.contains('gog-scroll--v')).toBe(true);
      expect(root.classList.contains('gog-scroll--h')).toBe(true);
      expect(root.classList.contains('gog-scroll--both')).toBe(true);
    });
  });

  it('applies the thin modifier class when size is thin', async () => {
    fixture.componentRef.setInput('size', 'thin');
    await fixture.whenStable();

    const root = fixture.nativeElement.querySelector('.gog-scroll') as HTMLElement;
    expect(root.classList.contains('gog-scroll--thin')).toBe(true);
  });

  describe('scroll metrics', () => {
    function dispatchScroll(): void {
      viewport.dispatchEvent(new Event('scroll'));
    }

    it('shows the vertical track and sizes/positions the thumb once content overflows', async () => {
      // clientHeight is large enough here that the --gog-scroll-thumb-min-size floor
      // (32px normal / 100px = 32%) never kicks in against the raw 25% below.
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', { value: 300, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);
      fixture.detectChanges();

      const track = fixture.nativeElement.querySelector('.gog-scroll__track--v') as HTMLElement;
      expect(track).toBeTruthy();

      const thumb = fixture.nativeElement.querySelector('.gog-scroll__thumb--v') as HTMLElement;
      // size = clientHeight / scrollHeight = 200/800 = 25%
      expect(thumb.style.height).toBe('25%');
      // pos = scrollTop / (scrollHeight - clientHeight) * (100 - size) = 300/600 * 75 = 37.5%
      expect(thumb.style.top).toBe('37.5%');
    });

    it('does not render a track when content does not overflow', async () => {
      mockMetrics(viewport, { scrollHeight: 100, clientHeight: 100 });
      dispatchScroll();
      await settleMeasure(fixture);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-scroll__track--v')).toBeNull();
    });

    it('hides the track when showTrack is off, without touching overflow-y', async () => {
      fixture.componentRef.setInput('showTrack', false);
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', { value: 300, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);
      fixture.detectChanges();

      // Still a real scroll container — showTrack only hides the visual affordance, native
      // wheel/touch/keyboard scrolling and any programmatic scrollIntoView keep working.
      expect(viewport.style.overflowY).toBe('auto');
      expect(fixture.nativeElement.querySelector('.gog-scroll__track--v')).toBeNull();
      expect(fixture.nativeElement.querySelector('.gog-scroll__thumb--v')).toBeNull();
    });

    it('falls back to GOG_CONFIG.scroll.showTrack when the input is unset', async () => {
      // The outer beforeEach already instantiated a TestBed environment (it created a
      // fixture), so a differently-provided one has to start from a clean slate.
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ScrollComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { scroll: { showTrack: false } } }],
      }).compileComponents();

      const configFixture = TestBed.createComponent(ScrollComponent);
      await configFixture.whenStable();
      const configViewport = configFixture.nativeElement.querySelector(
        '.gog-scroll__viewport',
      ) as HTMLElement;

      mockMetrics(configViewport, { scrollHeight: 800, clientHeight: 200 });
      configViewport.dispatchEvent(new Event('scroll'));
      await settleMeasure(configFixture);
      configFixture.detectChanges();

      expect(configFixture.nativeElement.querySelector('.gog-scroll__track--v')).toBeNull();
    });

    it('emits gogScroll with the current geometry', async () => {
      const emitted: unknown[] = [];
      component.gogScroll.subscribe((event) => emitted.push(event));

      mockMetrics(viewport, {
        scrollHeight: 400,
        clientHeight: 100,
        scrollWidth: 100,
        clientWidth: 100,
      });
      Object.defineProperty(viewport, 'scrollTop', { value: 50, configurable: true });
      Object.defineProperty(viewport, 'scrollLeft', { value: 0, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(emitted).toEqual([
        {
          scrollTop: 50,
          scrollLeft: 0,
          scrollHeight: 400,
          scrollWidth: 100,
          clientHeight: 100,
          clientWidth: 100,
        },
      ]);
    });

    it('emits gogReachEnd once when scrolled to the bottom, and gogReachStart when scrolled back', async () => {
      const starts: string[] = [];
      const ends: string[] = [];
      component.gogReachStart.subscribe((axis) => starts.push(axis));
      component.gogReachEnd.subscribe((axis) => ends.push(axis));

      mockMetrics(viewport, { scrollHeight: 400, clientHeight: 100 });
      Object.defineProperty(viewport, 'scrollTop', { value: 300, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(ends).toEqual(['vertical']);
      expect(starts).toEqual([]);

      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(starts).toEqual(['vertical']);
      // still just the one gogReachEnd from before — leaving the bottom doesn't re-fire it
      expect(ends).toEqual(['vertical']);
    });
  });

  describe('overscroll behavior', () => {
    function dispatchScroll(): void {
      viewport.dispatchEvent(new Event('scroll'));
    }

    it('defaults to auto (chains scroll to the next ancestor) when nothing overflows', () => {
      expect(component.overscrollBehavior()).toBeUndefined();
      expect(viewport.style.overscrollBehaviorY).toBe('auto');
    });

    it('applies the default only on an axis that is actually overflowing', async () => {
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(viewport.style.overscrollBehaviorY).toBe('auto');
    });

    it('applies an explicit overscrollBehavior input once the axis overflows', async () => {
      fixture.componentRef.setInput('overscrollBehavior', 'contain');
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(viewport.style.overscrollBehaviorY).toBe('contain');
    });

    it('leaves a non-overflowing axis at auto even with an explicit overscrollBehavior input', async () => {
      fixture.componentRef.setInput('overscrollBehavior', 'contain');
      mockMetrics(viewport, { scrollHeight: 100, clientHeight: 100 });
      dispatchScroll();
      await settleMeasure(fixture);

      expect(viewport.style.overscrollBehaviorY).toBe('auto');
    });

    it('falls back to GOG_CONFIG.scroll.overscrollBehavior when the input is unset', async () => {
      // The outer beforeEach already instantiated a TestBed environment (it created a
      // fixture), so a differently-provided one has to start from a clean slate.
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ScrollComponent],
        providers: [
          { provide: GOG_CONFIG, useValue: { scroll: { overscrollBehavior: 'contain' } } },
        ],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(ScrollComponent);
      const providedComponent = providedFixture.componentInstance;
      await providedFixture.whenStable();

      expect(providedComponent.overscrollBehavior()).toBeUndefined();
      expect(providedComponent['resolvedOverscrollBehavior']()).toBe('contain');
    });
  });

  describe('public scroll methods', () => {
    // jsdom doesn't implement Element.scrollTo, so it's stubbed rather than spied-on.
    it('scrollTo forwards to the viewport', () => {
      const spy = vi.fn();
      viewport.scrollTo = spy;
      component.scrollTo({ top: 10, left: 20 });
      expect(spy).toHaveBeenCalledWith({ top: 10, left: 20 });
    });

    it('scrollToTop/scrollToBottom/scrollToLeft/scrollToRight use the viewport extents', () => {
      mockMetrics(viewport, { scrollHeight: 400, scrollWidth: 200 });
      const spy = vi.fn();
      viewport.scrollTo = spy;

      component.scrollToTop('auto');
      expect(spy).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });

      component.scrollToBottom('auto');
      expect(spy).toHaveBeenLastCalledWith({ top: 400, behavior: 'auto' });

      component.scrollToLeft('auto');
      expect(spy).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' });

      component.scrollToRight('auto');
      expect(spy).toHaveBeenLastCalledWith({ left: 200, behavior: 'auto' });
    });
  });

  describe('thumb dragging', () => {
    beforeEach(async () => {
      // clientHeight large enough that the thumb-min-size floor (32px / 200px = 16%)
      // stays below the raw 25% thumb size computed here.
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', {
        value: 0,
        configurable: true,
        writable: true,
      });
      viewport.dispatchEvent(new Event('scroll'));
      await settleMeasure(fixture);
      fixture.detectChanges();
    });

    it('scrolls the viewport as the thumb is dragged', () => {
      const thumb = fixture.nativeElement.querySelector('.gog-scroll__thumb--v') as HTMLElement;
      const track = thumb.parentElement as HTMLElement;
      // The rendered track box (independent of the viewport's own client size above).
      Object.defineProperty(track, 'clientHeight', { value: 100, configurable: true });
      // jsdom doesn't implement pointer capture either.
      thumb.setPointerCapture = vi.fn();
      thumb.hasPointerCapture = vi.fn().mockReturnValue(true);
      thumb.releasePointerCapture = vi.fn();

      thumb.dispatchEvent(
        new PointerEvent('pointerdown', { clientY: 0, pointerId: 1, bubbles: true }),
      );
      // Track: 100px tall, thumb is 25% (25px) of it, so 75px of free travel maps to the
      // full 600px of scrollable content — a 30px drag should move scrollTop by 240px.
      thumb.dispatchEvent(
        new PointerEvent('pointermove', { clientY: 30, pointerId: 1, bubbles: true }),
      );

      expect(viewport.scrollTop).toBe(240);

      thumb.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
    });
  });
});
