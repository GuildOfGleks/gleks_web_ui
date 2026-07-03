import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast-service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should show toasts with defaults', () => {
    const id = service.show({ message: 'Saved' });

    expect(id).toBeTruthy();
    expect(service.toasts()).toEqual([
      {
        id,
        message: 'Saved',
        type: 'info',
        iconName: 'info',
        iconTemplate: null,
        isSticky: false,
        duration: 4000,
        position: 'bottom-right',
      },
    ]);
  });

  it('should dismiss and clear toasts', () => {
    const first = service.show({ message: 'Saved' });
    const second = service.show({ message: 'Done', type: 'success' });

    service.dismiss(first);
    expect(service.toasts().map((toast) => toast.id)).toEqual([second]);

    service.dismissAll();
    expect(service.toasts()).toEqual([]);
  });
});
