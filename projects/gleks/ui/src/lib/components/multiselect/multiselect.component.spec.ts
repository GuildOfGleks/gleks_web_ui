import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectComponent } from './multiselect.component';

describe('MultiselectComponent', () => {
  let component: MultiselectComponent;
  let fixture: ComponentFixture<MultiselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle selection from the native UI', () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('.gog-ms__option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['a']);
  });

  it('opens upward when requested', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.componentRef.setInput('dropdownDirection', 'up');
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-ms__dropdown')?.classList.contains('gog-ms__dropdown--up')).toBe(true);
  });

  it('applies the size modifier class to the host wrapper', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-ms-wrapper')?.classList.contains('gog-ms-wrapper--lg')).toBe(true);
  });

  describe('disabled', () => {
    it('removes the trigger from the tab order when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('-1');
    });

    it('keeps the trigger in the tab order when enabled', () => {
      fixture.detectChanges();

      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('0');
    });

    it('does not open when disabled', () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-ms__dropdown')).toBeNull();
    });
  });

  describe('errorMessage', () => {
    it('shows the error as soon as errorMessage is non-empty, even with a value already selected', () => {
      fixture.componentRef.setInput('value', ['a']);
      fixture.componentRef.setInput('errorMessage', 'Selection required');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-ms__error')?.textContent).toContain('Selection required');
    });

    it('hides the error only when the consumer clears errorMessage', () => {
      fixture.componentRef.setInput('errorMessage', 'Required');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-ms__error')).toBeTruthy();

      fixture.componentRef.setInput('errorMessage', '');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-ms__error')).toBeNull();
    });
  });

  describe('disabled options', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta', disabled: true },
        { id: 'c', name: 'Gamma' },
      ]);
      fixture.detectChanges();
    });

    it('ignores clicks on a disabled option', () => {
      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.gog-ms__option') as NodeListOf<HTMLButtonElement>;
      options[1].click();
      fixture.detectChanges();

      expect(component.value()).toEqual([]);
    });

    it('skips the disabled option when navigating with arrow keys', async () => {
      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-ms__option') as NodeListOf<HTMLButtonElement>;
      options[0].focus();
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();

      expect(document.activeElement).toBe(options[2]);
    });

    it('excludes disabled options from "select all"', () => {
      fixture.componentRef.setInput('showControls', true);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.gog-ms__controls gog-button button');
      (buttons[0] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toEqual(['a', 'c']);
    });
  });

  describe('select-all / clear', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.componentRef.setInput('showControls', true);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();
    });

    it('selects every option via the "select all" control', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.gog-ms__controls gog-button button');
      (buttons[0] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toEqual(['a', 'b']);
    });

    it('clears the selection via the "clear" control', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.gog-ms__controls gog-button button');
      (buttons[0] as HTMLButtonElement).click();
      fixture.detectChanges();
      (buttons[1] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toEqual([]);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
        { id: 'c', name: 'Gamma' },
      ]);
      fixture.detectChanges();
    });

    it('moves focus from the trigger into the option list with ArrowDown', async () => {
      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-ms__option') as NodeListOf<HTMLButtonElement>;
      expect(document.activeElement).toBe(options[0]);
    });

    it('moves focus with ArrowDown/ArrowUp/Home/End across options', async () => {
      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll('.gog-ms__option') as NodeListOf<HTMLButtonElement>;
      options[0].focus();
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[2]);

      options[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[0]);
    });

    it('closes the dropdown and refocuses the trigger on Escape from an option', async () => {
      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const option = fixture.nativeElement.querySelector('.gog-ms__option') as HTMLButtonElement;
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-ms__dropdown')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('appendToBody', () => {
    afterEach(() => {
      document.querySelectorAll('gog-multiselect-dropdown-portal').forEach((el) => el.remove());
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

      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();

      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });

    it('toggling an option from the portal updates the value', async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const portalOption = document.body.querySelector('[role="listbox"] .gog-ms__option') as HTMLButtonElement;
      portalOption.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.value()).toEqual(['a']);
    });
  });
});
