import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

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

  // `contain: layout` creates a stacking context, which would trap the panel's z-index
  // inside the control and let following page content paint over the open dropdown.
  it('does not apply layout containment to the element wrapping the panel', () => {
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.gog-ms-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('gog-contained-layout')).toBe(false);
  });

  describe('accessible name', () => {
    it('associates the visible label with the combobox trigger', () => {
      fixture.componentRef.setInput('label', 'Tags');
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.gog-ms__label') as HTMLElement;
      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;

      expect(label.id).toBeTruthy();
      expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);
      // Setting `label` suppresses aria-label, so without the association above the
      // combobox would be left with no accessible name at all.
      expect(trigger.hasAttribute('aria-label')).toBe(false);
    });

    it('falls back to ariaLabel when there is no visible label', () => {
      fixture.componentRef.setInput('ariaLabel', 'Pick tags');
      fixture.detectChanges();

      const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      expect(trigger.getAttribute('aria-labelledby')).toBeNull();
      expect(trigger.getAttribute('aria-label')).toBe('Pick tags');
    });

    it('gives each instance its own ids so several can coexist on a page', async () => {
      const second = TestBed.createComponent(MultiselectComponent);
      second.componentRef.setInput('label', 'Other');
      fixture.componentRef.setInput('label', 'First');
      fixture.detectChanges();
      second.detectChanges();
      await second.whenStable();

      const firstLabel = fixture.nativeElement.querySelector('.gog-ms__label') as HTMLElement;
      const secondLabel = second.nativeElement.querySelector('.gog-ms__label') as HTMLElement;
      expect(firstLabel.id).not.toBe(secondLabel.id);
    });
  });

  describe('tab order', () => {
    it('keeps the option list to a single tab stop', () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-ms__option',
      ) as NodeListOf<HTMLButtonElement>;
      expect(options.length).toBe(2);
      for (const option of options) {
        expect(option.tabIndex).toBe(-1);
      }
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
      document.querySelectorAll('.gog-overlay-host').forEach((el) => el.remove());
    });

    it('renders exactly one listbox, not an inline one alongside the appended one', async () => {
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

      expect(document.querySelectorAll('[role="listbox"]').length).toBe(1);
      expect(fixture.nativeElement.querySelector('.gog-ms__dropdown')).toBeNull();
    });

    it('applies the portal size modifier so the panel keeps its sizing outside the wrapper', async () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      expect(panel.classList.contains('gog-ms__dropdown--portal')).toBe(true);
      expect(panel.classList.contains('gog-ms__dropdown--lg')).toBe(true);
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

    it('keeps the appended panel in step with the selection without re-attaching it', async () => {
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

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      (panel.querySelector('.gog-ms__option') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Same panel element, updated in place: the overlay renders the component's own
      // template, so selection state propagates without any manual field syncing.
      expect(document.body.querySelector('[role="listbox"]')).toBe(panel);
      const options = panel.querySelectorAll('.gog-ms__option');
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      imports: [MultiselectComponent, ReactiveFormsModule],
      template: `
        <gog-multiselect [formControl]="control" [options]="options" errorMessage="Pick at least one" />
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class MultiselectFormHostComponent {
      readonly control = new FormControl<(string | number)[]>([], {
        nonNullable: true,
        validators: Validators.required,
      });
      readonly options = [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ];
    }

    let hostFixture: ComponentFixture<MultiselectFormHostComponent>;
    let host: MultiselectFormHostComponent;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(MultiselectFormHostComponent);
      host = hostFixture.componentInstance;
      await hostFixture.whenStable();
    });

    it('applies values written to the FormControl', async () => {
      host.control.setValue(['b']);
      await hostFixture.whenStable();

      const value = hostFixture.nativeElement.querySelector('.gog-ms__value') as HTMLElement;
      expect(value.textContent?.trim()).toBe('Beta');
    });

    it('propagates toggles to the FormControl value', async () => {
      (hostFixture.nativeElement.querySelector('.gog-ms') as HTMLElement).click();
      await hostFixture.whenStable();

      (hostFixture.nativeElement.querySelector('.gog-ms__option') as HTMLButtonElement).click();
      await hostFixture.whenStable();

      expect(host.control.value).toEqual(['a']);
    });

    it('disables the trigger when the FormControl is disabled', async () => {
      host.control.disable();
      await hostFixture.whenStable();

      const trigger = hostFixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('-1');
      expect(trigger.getAttribute('aria-disabled')).toBe('true');
    });

    it('withholds the error until the control has been touched', async () => {
      expect(host.control.invalid).toBe(true);
      expect(hostFixture.nativeElement.querySelector('.gog-ms__error')).toBeNull();

      const trigger = hostFixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
      trigger.click();
      await hostFixture.whenStable();
      trigger.click();
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-ms__error')?.textContent).toContain(
        'Pick at least one',
      );
    });
  });
});
