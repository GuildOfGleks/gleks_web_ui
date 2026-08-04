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
      await fixture.whenStable();
      // Metrics are read on the next animation frame.
      await new Promise((resolve) => requestAnimationFrame(resolve));
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
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-scroll__track--v')).toBeNull();
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
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(emitted).toEqual([
        { scrollTop: 50, scrollLeft: 0, scrollHeight: 400, scrollWidth: 100, clientHeight: 100, clientWidth: 100 },
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
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(ends).toEqual(['vertical']);
      expect(starts).toEqual([]);

      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true });
      dispatchScroll();
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

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
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(viewport.style.overscrollBehaviorY).toBe('auto');
    });

    it('applies an explicit overscrollBehavior input once the axis overflows', async () => {
      fixture.componentRef.setInput('overscrollBehavior', 'contain');
      mockMetrics(viewport, { scrollHeight: 800, clientHeight: 200 });
      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true });
      dispatchScroll();
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(viewport.style.overscrollBehaviorY).toBe('contain');
    });

    it('leaves a non-overflowing axis at auto even with an explicit overscrollBehavior input', async () => {
      fixture.componentRef.setInput('overscrollBehavior', 'contain');
      mockMetrics(viewport, { scrollHeight: 100, clientHeight: 100 });
      dispatchScroll();
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(viewport.style.overscrollBehaviorY).toBe('auto');
    });

    it('falls back to GOG_CONFIG.scroll.overscrollBehavior when the input is unset', async () => {
      // The outer beforeEach already instantiated a TestBed environment (it created a
      // fixture), so a differently-provided one has to start from a clean slate.
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ScrollComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { scroll: { overscrollBehavior: 'contain' } } }],
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
      Object.defineProperty(viewport, 'scrollTop', { value: 0, configurable: true, writable: true });
      viewport.dispatchEvent(new Event('scroll'));
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));
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
