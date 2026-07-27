import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DialogComponent } from './dialog.component';
import { DialogService } from '../../services/dialog-service/dialog.service';

@Component({
  standalone: true,
  template: `<input class="first-input" /><button type="button" class="second-button">Second</button>`,
})
class DialogContentComponent {}

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let dialogService: DialogService;
  let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    await fixture.whenStable();

    // jsdom never lays elements out, so getBoundingClientRect always reports zero size —
    // the focus-trap's isVisible() check would otherwise treat every element as hidden.
    getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        width: 100,
        height: 20,
        top: 0,
        left: 0,
        right: 100,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => '',
      } as DOMRect);
  });

  afterEach(() => {
    dialogService.closeAll();
    getBoundingClientRectSpy.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the configured component and title when a dialog opens', async () => {
    dialogService.open({ component: DialogContentComponent, title: 'My dialog' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-dialog__title')?.textContent).toContain('My dialog');
    expect(fixture.nativeElement.querySelector('.first-input')).toBeTruthy();
  });

  it('auto-focuses the first focusable element in the panel when it opens', async () => {
    // No title/close button here so the panel's only focusables are the projected ones.
    dialogService.open({ component: DialogContentComponent, closable: false });
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.first-input'));
  });

  it('resolves afterClosed with the value passed to close()', async () => {
    const ref = dialogService.open<string>({ component: DialogContentComponent });
    fixture.detectChanges();
    await fixture.whenStable();

    ref.close('confirmed');
    fixture.detectChanges();

    await expect(ref.afterClosed).resolves.toBe('confirmed');
  });

  describe('closing', () => {
    it('closes on Escape by default', async () => {
      dialogService.open({ component: DialogContentComponent });
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(dialogService.dialogs().length).toBe(0);
    });

    it('does not close on Escape when closable is false', async () => {
      dialogService.open({ component: DialogContentComponent, closable: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(dialogService.dialogs().length).toBe(1);
    });

    it('closes when a press and release both land directly on the backdrop', async () => {
      dialogService.open({ component: DialogContentComponent });
      fixture.detectChanges();
      await fixture.whenStable();

      const backdrop = fixture.nativeElement.querySelector('.gog-dialog__backdrop') as HTMLElement;
      backdrop.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      backdrop.dispatchEvent(new Event('pointerup', { bubbles: true }));
      fixture.detectChanges();

      expect(dialogService.dialogs().length).toBe(0);
    });

    it('does not close when the press starts on the backdrop but the release lands inside the panel (drag-through)', async () => {
      dialogService.open({ component: DialogContentComponent });
      fixture.detectChanges();
      await fixture.whenStable();

      const backdrop = fixture.nativeElement.querySelector('.gog-dialog__backdrop') as HTMLElement;
      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      backdrop.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      panel.dispatchEvent(new Event('pointerup', { bubbles: true }));
      fixture.detectChanges();

      expect(dialogService.dialogs().length).toBe(1);
    });

    it('never closes via backdrop when closable is false', async () => {
      dialogService.open({ component: DialogContentComponent, closable: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const backdrop = fixture.nativeElement.querySelector('.gog-dialog__backdrop') as HTMLElement;
      backdrop.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      backdrop.dispatchEvent(new Event('pointerup', { bubbles: true }));
      fixture.detectChanges();

      expect(dialogService.dialogs().length).toBe(1);
    });
  });

  describe('focus trap', () => {
    it('wraps focus from the last focusable element back to the first on Tab', async () => {
      dialogService.open({ component: DialogContentComponent, closable: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      const firstInput = fixture.nativeElement.querySelector('.first-input') as HTMLElement;
      const secondButton = fixture.nativeElement.querySelector('.second-button') as HTMLElement;

      secondButton.focus();
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

      expect(document.activeElement).toBe(firstInput);
    });

    it('wraps focus from the first focusable element back to the last on Shift+Tab', async () => {
      dialogService.open({ component: DialogContentComponent, closable: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      const firstInput = fixture.nativeElement.querySelector('.first-input') as HTMLElement;
      const secondButton = fixture.nativeElement.querySelector('.second-button') as HTMLElement;

      firstInput.focus();
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));

      expect(document.activeElement).toBe(secondButton);
    });

    it('does not trap focus when modal is false', async () => {
      dialogService.open({ component: DialogContentComponent, modal: false });
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = fixture.nativeElement.querySelector('.gog-dialog__panel') as HTMLElement;
      const secondButton = fixture.nativeElement.querySelector('.second-button') as HTMLElement;

      secondButton.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      panel.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('dragging', () => {
    it('moves the dialog when dragging from the header', async () => {
      dialogService.open({ component: DialogContentComponent, title: 'Draggable' });
      fixture.detectChanges();
      await fixture.whenStable();

      const header = fixture.nativeElement.querySelector('.gog-dialog__header') as HTMLElement;
      header.dispatchEvent(new MouseEvent('pointerdown', { clientX: 10, clientY: 10, button: 0, bubbles: true }));
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 40, clientY: 35, bubbles: true }));

      const dialog = dialogService.dialogs()[0];
      expect(dialog.offsetX).toBe(30);
      expect(dialog.offsetY).toBe(25);

      document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    });

    it('does not start a drag when the pointer goes down on a header button', async () => {
      dialogService.open({ component: DialogContentComponent, title: 'Draggable' });
      fixture.detectChanges();
      await fixture.whenStable();

      const closeButton = fixture.nativeElement.querySelector('.gog-dialog__close') as HTMLElement;
      closeButton.dispatchEvent(new MouseEvent('pointerdown', { clientX: 10, clientY: 10, button: 0, bubbles: true }));
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 40, clientY: 35, bubbles: true }));

      const dialog = dialogService.dialogs()[0];
      expect(dialog.offsetX).toBe(0);
      expect(dialog.offsetY).toBe(0);
    });
  });
});
