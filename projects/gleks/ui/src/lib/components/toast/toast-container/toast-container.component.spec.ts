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
      { id: 'a', message: 'A', type: 'info', iconName: 'info', iconTemplate: null, actions: [], isSticky: false, duration: 4000, position: 'top-right', dedupeKey: 'a', revision: 0 },
      { id: 'b', message: 'B', type: 'info', iconName: 'info', iconTemplate: null, actions: [], isSticky: false, duration: 4000, position: 'top-right', dedupeKey: 'b', revision: 0 },
      { id: 'c', message: 'C', type: 'info', iconName: 'info', iconTemplate: null, actions: [], isSticky: false, duration: 4000, position: 'top-right', dedupeKey: 'c', revision: 0 },
    ]);
    fixture.detectChanges();

    const group = component.groups().find((g) => g.position === 'top-right');
    expect(group?.toasts.map((t) => t.id)).toEqual(['a', 'b']);
  });
});
