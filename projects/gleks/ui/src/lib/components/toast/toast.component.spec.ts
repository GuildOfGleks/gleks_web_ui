import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('toast', {
      id: 'toast-1',
      message: 'Saved',
      type: 'success',
      iconName: 'success',
      iconTemplate: null,
      actions: [],
      isSticky: true,
      duration: 4000,
      position: 'bottom-right',
      dedupeKey: 'Saved|success|success|bottom-right|default',
      revision: 0,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restart the progress bar animation without throwing when a toast is refreshed', async () => {
    fixture.componentRef.setInput('toast', {
      id: 'toast-2',
      message: 'Queued',
      type: 'info',
      iconName: 'info',
      iconTemplate: null,
      actions: [],
      isSticky: false,
      duration: 4000,
      position: 'bottom-right',
      dedupeKey: 'Queued|info|info|bottom-right|default|',
      revision: 0,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const progress = fixture.nativeElement.querySelector('.gog-toast__progress') as HTMLElement;
    expect(progress).toBeTruthy();

    fixture.componentRef.setInput('toast', {
      id: 'toast-2',
      message: 'Queued',
      type: 'info',
      iconName: 'info',
      iconTemplate: null,
      actions: [],
      isSticky: false,
      duration: 4000,
      position: 'bottom-right',
      dedupeKey: 'Queued|info|info|bottom-right|default|',
      revision: 1,
    });

    expect(() => fixture.detectChanges()).not.toThrow();
    await fixture.whenStable();

    expect(progress.style.animation).toBe('');
  });

  it('should not auto-dismiss a queued (non-front) toast, and should start counting down once promoted to front', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    try {
      const dismissedSpy = vi.fn();
      const queuedFixture = TestBed.createComponent(ToastComponent);
      queuedFixture.componentInstance.dismissed.subscribe(dismissedSpy);
      queuedFixture.componentRef.setInput('toast', {
        id: 'toast-queued',
        message: 'Queued toast',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        actions: [],
        isSticky: false,
        duration: 1000,
        position: 'top-right',
        dedupeKey: 'Queued toast|info|info|top-right|default|',
        revision: 0,
      });
      queuedFixture.componentRef.setInput('isFront', false);
      queuedFixture.detectChanges();
      await queuedFixture.whenStable();

      vi.advanceTimersByTime(5000);
      queuedFixture.detectChanges();
      expect(dismissedSpy).not.toHaveBeenCalled();

      queuedFixture.componentRef.setInput('isFront', true);
      queuedFixture.detectChanges();
      await queuedFixture.whenStable();

      vi.advanceTimersByTime(999);
      queuedFixture.detectChanges();
      expect(dismissedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      queuedFixture.detectChanges();
      await Promise.resolve();
      expect(dismissedSpy).toHaveBeenCalledWith('toast-queued');
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the countdown on hover and resumes it on mouseleave', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    try {
      const dismissedSpy = vi.fn();
      component.dismissed.subscribe(dismissedSpy);
      fixture.componentRef.setInput('toast', {
        id: 'toast-hover',
        message: 'Hover me',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        actions: [],
        isSticky: false,
        duration: 1000,
        position: 'bottom-right',
        dedupeKey: 'Hover me|info|info|bottom-right|default|',
        revision: 0,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('.gog-toast') as HTMLElement;
      vi.advanceTimersByTime(500);
      host.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();

      // Paused partway through — waiting out the full original duration shouldn't dismiss it.
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(dismissedSpy).not.toHaveBeenCalled();

      host.dispatchEvent(new Event('mouseleave'));
      fixture.detectChanges();

      // Only the remaining ~500ms should be left on the clock.
      vi.advanceTimersByTime(499);
      fixture.detectChanges();
      expect(dismissedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      await Promise.resolve();
      expect(dismissedSpy).toHaveBeenCalledWith('toast-hover');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes immediately (no transition wait) when the user prefers reduced motion', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    const dismissedSpy = vi.fn();
    component.dismissed.subscribe(dismissedSpy);

    const closeButton = fixture.nativeElement.querySelector(
      '.gog-toast__close button',
    ) as HTMLButtonElement;
    closeButton.click();
    await Promise.resolve();

    expect(dismissedSpy).toHaveBeenCalledWith('toast-1');
  });

  it('invokes an action callback with the current toast when its button is clicked', async () => {
    const onClick = vi.fn();
    fixture.componentRef.setInput('toast', {
      id: 'toast-action',
      message: 'With action',
      type: 'info',
      iconName: 'info',
      iconTemplate: null,
      actions: [{ label: 'Undo', onClick }],
      isSticky: true,
      duration: 4000,
      position: 'bottom-right',
      dedupeKey: 'With action|info|info|bottom-right|default|Undo:',
      revision: 0,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const actionButton = fixture.nativeElement.querySelector(
      '.gog-toast__action button',
    ) as HTMLButtonElement;
    actionButton.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].id).toBe('toast-action');
  });
});
