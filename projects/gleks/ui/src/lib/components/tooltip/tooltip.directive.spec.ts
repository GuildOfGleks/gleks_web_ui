import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { GOG_CONFIG } from '../../shared/config';
import { GogTooltipDirective } from './tooltip.directive';

@Component({
  template: `
    <button
      [gogTooltip]="text"
      [gogTooltipPosition]="position"
      [gogTooltipShowDelay]="showDelay"
      [gogTooltipHideDelay]="hideDelay"
      [gogTooltipDisabled]="disabled"
    >
      Trigger
    </button>
  `,
  imports: [GogTooltipDirective],
})
class HostComponent {
  text: string | null = 'Hint text';
  position: 'auto' | 'top' | 'bottom' | 'left' | 'right' | undefined = undefined;
  showDelay: number | undefined = undefined;
  hideDelay: number | undefined = undefined;
  disabled = false;
}

function bubble(): HTMLElement | null {
  return document.body.querySelector('.gog-tooltip');
}

describe('GogTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let trigger: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    // The directive detaches on destroy, but destroy the fixture explicitly so a failed
    // assertion mid-test can't leave a bubble in document.body for the next test to see.
    fixture.destroy();
    vi.useRealTimers();
  });

  it('does not render a bubble until hovered', () => {
    expect(bubble()).toBeNull();
  });

  it('shows the bubble after the default 300ms show delay, not before', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    vi.advanceTimersByTime(299);
    fixture.detectChanges();
    expect(bubble()).toBeNull();

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();
    expect(bubble()?.textContent?.trim()).toBe('Hint text');
  });

  it('hides the bubble after the default 100ms hide delay on mouseleave', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    vi.advanceTimersByTime(99);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(bubble()).toBeNull();
  });

  it('cancels a pending show if the pointer leaves before the delay elapses', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(200);
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(bubble()).toBeNull();
  });

  it('honours per-instance show/hide delay overrides', () => {
    vi.useFakeTimers();
    const overrideFixture = TestBed.createComponent(HostComponent);
    overrideFixture.componentInstance.showDelay = 50;
    overrideFixture.componentInstance.hideDelay = 20;
    overrideFixture.detectChanges();
    const overrideTrigger = overrideFixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    overrideTrigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(50);
    overrideFixture.detectChanges();
    expect(bubble()).not.toBeNull();

    overrideTrigger.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(20);
    overrideFixture.detectChanges();
    expect(bubble()).toBeNull();
    overrideFixture.destroy();
  });

  it('shows on focusin and hides on focusout', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(bubble()).toBeNull();
  });

  it('dismisses immediately on Escape instead of waiting out the hide delay', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(bubble()).toBeNull();
  });

  it('never shows when disabled', () => {
    vi.useFakeTimers();
    const disabledFixture = TestBed.createComponent(HostComponent);
    disabledFixture.componentInstance.disabled = true;
    disabledFixture.detectChanges();
    const disabledTrigger = disabledFixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    disabledTrigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    disabledFixture.detectChanges();

    expect(bubble()).toBeNull();
    disabledFixture.destroy();
  });

  it('never shows when the content is empty', () => {
    vi.useFakeTimers();
    const emptyFixture = TestBed.createComponent(HostComponent);
    emptyFixture.componentInstance.text = '';
    emptyFixture.detectChanges();
    const emptyTrigger = emptyFixture.nativeElement.querySelector('button') as HTMLButtonElement;

    emptyTrigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    emptyFixture.detectChanges();

    expect(bubble()).toBeNull();
    emptyFixture.destroy();
  });

  it('sets aria-describedby only while the bubble is visible', () => {
    vi.useFakeTimers();
    expect(trigger.getAttribute('aria-describedby')).toBeNull();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(bubble()?.id).toBe(describedBy);

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('stays open when the pointer moves onto the bubble before the hide delay elapses', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const shownBubble = bubble();
    expect(shownBubble).not.toBeNull();

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(50);
    shownBubble!.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();

    expect(bubble()).not.toBeNull();
  });

  it('closes on the hide delay after the pointer leaves the bubble', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const shownBubble = bubble();

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    shownBubble!.dispatchEvent(new MouseEvent('mouseenter'));
    shownBubble!.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(99);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(bubble()).toBeNull();
  });

  it('removes the bubble from document.body when the host is destroyed while shown', () => {
    vi.useFakeTimers();
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(bubble()).not.toBeNull();

    fixture.destroy();
    expect(bubble()).toBeNull();
  });
});

describe('GogTooltipDirective with GOG_CONFIG', () => {
  it('falls back to GOG_CONFIG.tooltip.showDelay/hideDelay when the instance sets neither', () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          { provide: GOG_CONFIG, useValue: { tooltip: { showDelay: 10, hideDelay: 5 } } },
        ],
      });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(10);
      fixture.detectChanges();
      expect(bubble()).not.toBeNull();

      trigger.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(5);
      fixture.detectChanges();
      expect(bubble()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('an instance input still wins over GOG_CONFIG', () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { tooltip: { showDelay: 999 } } }],
      });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.showDelay = 25;
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(25);
      fixture.detectChanges();
      expect(bubble()).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
