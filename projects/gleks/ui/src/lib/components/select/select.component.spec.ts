import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('selects an option from the dropdown', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
    control.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const option = fixture.nativeElement.querySelector('.gog-select__option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe('a');
    expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
  });

  it('opens upward when requested', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.componentRef.setInput('dropdownDirection', 'up');
    fixture.detectChanges();
    await fixture.whenStable();

    const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
    control.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-select__dropdown')?.classList.contains('gog-select__dropdown--up')).toBe(true);
  });

  it('applies the size modifier class to the host wrapper', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-select')?.classList.contains('gog-select--lg')).toBe(true);
  });

  describe('errorMessage', () => {
    it('shows the error as soon as errorMessage is non-empty, even with a value already selected', () => {
      fixture.componentRef.setInput('value', 'a');
      fixture.componentRef.setInput('errorMessage', 'Selection required');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-select__error')?.textContent).toContain('Selection required');
    });

    it('hides the error only when the consumer clears errorMessage', () => {
      fixture.componentRef.setInput('errorMessage', 'Required');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-select__error')).toBeTruthy();

      fixture.componentRef.setInput('errorMessage', '');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-select__error')).toBeNull();
    });
  });

  describe('disabled options', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta', disabled: true },
        { id: 'c', name: 'Gamma' },
      ]);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('ignores clicks on a disabled option', async () => {
      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-select__option') as NodeListOf<HTMLButtonElement>;
      options[1].click();
      fixture.detectChanges();

      expect(component.value()).toBeNull();
    });

    it('skips the disabled option when navigating with arrow keys', async () => {
      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-select__option') as NodeListOf<HTMLButtonElement>;
      options[0].focus();
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();

      expect(document.activeElement).toBe(options[2]);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
        { id: 'c', name: 'Gamma' },
      ]);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('moves focus from the trigger into the option list with ArrowDown', async () => {
      const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-select__option') as NodeListOf<HTMLButtonElement>;
      expect(document.activeElement).toBe(options[0]);
    });

    it('moves focus with ArrowDown/ArrowUp/Home/End across options', async () => {
      const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-select__option') as NodeListOf<HTMLButtonElement>;
      options[0].focus();
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[2]);

      options[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[0]);
    });

    it('closes the dropdown and refocuses the trigger on Escape from an option', async () => {
      const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const option = fixture.nativeElement.querySelector('.gog-select__option') as HTMLButtonElement;
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
      expect(document.activeElement).toBe(control);
    });
  });

  describe('appendToBody', () => {
    afterEach(() => {
      document.querySelectorAll('gog-select-dropdown-portal').forEach((el) => el.remove());
    });

    it('renders the dropdown into document.body and removes it on close', async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeNull();

      const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const portalListbox = document.body.querySelector('[role="listbox"]');
      expect(portalListbox).toBeTruthy();

      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });

    it('selecting an option from the portal updates the value and closes it', async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const portalOption = document.body.querySelector('[role="listbox"] .gog-select__option') as HTMLButtonElement;
      portalOption.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.value()).toBe('a');
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  });
});
