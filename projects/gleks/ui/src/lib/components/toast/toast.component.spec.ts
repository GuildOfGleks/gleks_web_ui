import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
