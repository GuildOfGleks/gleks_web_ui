import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastService } from '../../../services/toast-service/toast-service';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    TestBed.inject(ToastService).toasts.set([
      {
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
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the oldest toasts visible (FIFO) and queue overflow at the back', () => {
    fixture.componentRef.setInput('maxVisiblePerPosition', 2);
    TestBed.inject(ToastService).toasts.set([
      {
        id: 'a',
        message: 'A',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        actions: [],
        isSticky: false,
        duration: 4000,
        position: 'top-right',
        dedupeKey: 'a',
        revision: 0,
      },
      {
        id: 'b',
        message: 'B',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        actions: [],
        isSticky: false,
        duration: 4000,
        position: 'top-right',
        dedupeKey: 'b',
        revision: 0,
      },
      {
        id: 'c',
        message: 'C',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        actions: [],
        isSticky: false,
        duration: 4000,
        position: 'top-right',
        dedupeKey: 'c',
        revision: 0,
      },
    ]);
    fixture.detectChanges();

    const group = component.groups().find((g) => g.position === 'top-right');
    expect(group?.toasts.map((t) => t.id)).toEqual(['a', 'b']);
  });

  describe('live regions', () => {
    const politeRegion = () => fixture.nativeElement.querySelector('[aria-live="polite"]');
    const assertiveRegion = () => fixture.nativeElement.querySelector('[aria-live="assertive"]');

    /** Clears the toast the outer `beforeEach` seeds, so each case starts from an empty stack. */
    async function withToasts(...toasts: Parameters<ToastService['show']>[0][]): Promise<void> {
      const service = TestBed.inject(ToastService);
      service.toasts.set([]);
      for (const toast of toasts) service.show(toast);
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('mounts both regions before any toast exists', async () => {
      // The whole point: a live region added at the same moment as its text is routinely
      // skipped by screen readers, so these have to be present while the stack is still empty.
      await withToasts();

      expect(politeRegion()).toBeTruthy();
      expect(assertiveRegion()).toBeTruthy();
      expect(politeRegion().textContent.trim()).toBe('');
      expect(assertiveRegion().textContent.trim()).toBe('');
    });

    it('routes an informational toast to the polite region', async () => {
      await withToasts({ message: 'Saved', type: 'success' });

      expect(politeRegion().textContent).toContain('Saved');
      expect(assertiveRegion().textContent).not.toContain('Saved');
    });

    it('routes errors and warnings to the assertive region', async () => {
      await withToasts(
        { message: 'Upload failed', type: 'error' },
        { message: 'Low disk space', type: 'warning' },
      );

      expect(assertiveRegion().textContent).toContain('Upload failed');
      expect(assertiveRegion().textContent).toContain('Low disk space');
      expect(politeRegion().textContent.trim()).toBe('');
    });

    it('drops the announcement when the toast is dismissed', async () => {
      const service = TestBed.inject(ToastService);
      service.toasts.set([]);
      const id = service.show({ message: 'Saved', type: 'success' });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(politeRegion().textContent).toContain('Saved');

      service.dismiss(id);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(politeRegion().textContent).not.toContain('Saved');
    });

    it('does not announce a toast queued beyond maxVisiblePerPosition', async () => {
      fixture.componentRef.setInput('maxVisiblePerPosition', 1);
      await withToasts(
        { message: 'First', type: 'info', position: 'top-right' },
        { message: 'Second', type: 'info', position: 'top-right' },
      );

      expect(politeRegion().textContent).toContain('First');
      expect(politeRegion().textContent).not.toContain('Second');
    });

    it('leaves the individual toast without a live region of its own', async () => {
      await withToasts({ message: 'Saved', type: 'success' });

      const toast = fixture.nativeElement.querySelector('gog-toast') as HTMLElement;
      expect(toast).toBeTruthy();
      expect(toast.getAttribute('aria-live')).toBeNull();
      expect(toast.getAttribute('role')).toBeNull();
    });
  });
});
