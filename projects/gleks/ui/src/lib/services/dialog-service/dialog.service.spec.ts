import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';

class DummyDialogComponent {}

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('should open and close dialogs', async () => {
    const ref = service.open({ component: DummyDialogComponent });

    expect(service.dialogs().length).toBe(1);

    ref.close('done');

    await ref.afterClosed.then((result) => expect(result).toBe('done'));
    expect(service.dialogs()).toEqual([]);
  });

  it('should close all dialogs', async () => {
    const first = service.open({ component: DummyDialogComponent });
    const second = service.open({ component: DummyDialogComponent });

    service.closeAll(true);

    await first.afterClosed.then((result) => expect(result).toBe(true));
    await second.afterClosed.then((result) => expect(result).toBe(true));
    expect(service.dialogs()).toEqual([]);
  });
});
