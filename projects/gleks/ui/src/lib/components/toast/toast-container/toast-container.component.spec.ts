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
});
