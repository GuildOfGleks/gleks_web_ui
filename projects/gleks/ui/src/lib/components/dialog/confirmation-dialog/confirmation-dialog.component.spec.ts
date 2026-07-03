import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DIALOG_DATA, DIALOG_REF } from '../dialog.tokens';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            title: 'Delete item',
            description: 'This cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
          },
        },
        {
          provide: DIALOG_REF,
          useValue: {
            close: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
