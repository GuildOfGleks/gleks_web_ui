import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { vi } from 'vitest';

import { SelectComponent } from './select.component';
import { GOG_CONFIG } from '../../shared/config';

function stubRect(target: Element, rect: Partial<DOMRect>): void {
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  } as DOMRect);
}

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

  describe('fullWidth', () => {
    it('should not apply the auto-width host class by default', () => {
      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(false);
    });

    it('should apply the auto-width host class when set to false', async () => {
      fixture.componentRef.setInput('fullWidth', false);
      await fixture.whenStable();

      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(true);
    });
  });

  it('selects an option from the dropdown', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const control = fixture.nativeElement.querySelector(
      '.gog-select__control',
    ) as HTMLButtonElement;
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

    const control = fixture.nativeElement.querySelector(
      '.gog-select__control',
    ) as HTMLButtonElement;
    control.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      fixture.nativeElement
        .querySelector('.gog-select__dropdown')
        ?.classList.contains('gog-select__dropdown--up'),
    ).toBe(true);
  });

  it('applies the size modifier class to the host wrapper', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.gog-select')?.classList.contains('gog-select--lg'),
    ).toBe(true);
  });

  describe('errorMessage', () => {
    it('shows the error as soon as errorMessage is non-empty, even with a value already selected', () => {
      fixture.componentRef.setInput('value', 'a');
      fixture.componentRef.setInput('errorMessage', 'Selection required');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-select__error')?.textContent).toContain(
        'Selection required',
      );
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

  // `contain: layout` creates a stacking context, which would trap the panel's z-index
  // inside the control and let following page content paint over the open dropdown.
  it('does not apply layout containment to the element wrapping the panel', () => {
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.gog-select') as HTMLElement;
    expect(wrapper.classList.contains('gog-contained-layout')).toBe(false);
  });

  describe('click outside', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('closes when a click lands outside the component', async () => {
      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
    });

    it('ignores clicks inside the appended panel', async () => {
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      expect(panel).toBeTruthy();

      // The panel is a sibling of the component in the DOM, so "inside" has to be decided
      // against the overlay host as well as the component element.
      panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });

    it('stops listening once closed', async () => {
      const added: string[] = [];
      const originalAdd = document.addEventListener.bind(document);
      const spy = (type: string, ...rest: unknown[]) => {
        added.push(type);
        return (originalAdd as (t: string, ...r: unknown[]) => void)(type, ...rest);
      };
      document.addEventListener = spy as typeof document.addEventListener;

      try {
        const control = fixture.nativeElement.querySelector(
          '.gog-select__control',
        ) as HTMLButtonElement;
        control.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(added.filter((type) => type === 'click').length).toBe(1);

        control.click();
        fixture.detectChanges();
        await fixture.whenStable();

        // Reopening must not stack a second listener on top of the first.
        control.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(added.filter((type) => type === 'click').length).toBe(2);
      } finally {
        document.addEventListener = originalAdd as typeof document.addEventListener;
      }
    });
  });

  describe('accessible name', () => {
    it('associates the visible label with the trigger via aria-labelledby', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.detectChanges();
      await fixture.whenStable();

      const label = fixture.nativeElement.querySelector('.gog-select__label') as HTMLElement;
      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;

      expect(label.id).toBeTruthy();
      expect(control.getAttribute('aria-labelledby')).toBe(label.id);
      // `for` on a <button> is ignored by browsers, so it must not be relied on.
      expect(label.hasAttribute('for')).toBe(false);
      expect(control.hasAttribute('aria-label')).toBe(false);
    });

    it('falls back to ariaLabel when there is no visible label', async () => {
      fixture.componentRef.setInput('ariaLabel', 'Pick a region');
      fixture.detectChanges();
      await fixture.whenStable();

      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      expect(control.getAttribute('aria-labelledby')).toBeNull();
      expect(control.getAttribute('aria-label')).toBe('Pick a region');
    });
  });

  describe('tab order', () => {
    it('keeps the option list to a single tab stop', async () => {
      fixture.componentRef.setInput('options', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ]);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-select__option',
      ) as NodeListOf<HTMLButtonElement>;
      expect(options.length).toBe(2);
      for (const option of options) {
        expect(option.tabIndex).toBe(-1);
      }
    });

    it('closes and returns focus to the trigger when tabbing out of the list', async () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.detectChanges();
      await fixture.whenStable();

      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const option = fixture.nativeElement.querySelector(
        '.gog-select__option',
      ) as HTMLButtonElement;
      option.focus();
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
      expect(document.activeElement).toBe(control);
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

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-select__option',
      ) as NodeListOf<HTMLButtonElement>;
      options[1].click();
      fixture.detectChanges();

      expect(component.value()).toBeNull();
    });

    it('skips the disabled option when navigating with arrow keys', async () => {
      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-select__option',
      ) as NodeListOf<HTMLButtonElement>;
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
      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-select__option',
      ) as NodeListOf<HTMLButtonElement>;
      expect(document.activeElement).toBe(options[0]);
    });

    it('moves focus with ArrowDown/ArrowUp/Home/End across options', async () => {
      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.nativeElement.querySelectorAll(
        '.gog-select__option',
      ) as NodeListOf<HTMLButtonElement>;
      options[0].focus();
      options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[2]);

      options[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await fixture.whenStable();
      expect(document.activeElement).toBe(options[0]);
    });

    it('closes the dropdown and refocuses the trigger on Escape from an option', async () => {
      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const option = fixture.nativeElement.querySelector(
        '.gog-select__option',
      ) as HTMLButtonElement;
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
      expect(document.activeElement).toBe(control);
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

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.querySelectorAll('[role="listbox"]').length).toBe(1);
      expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
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

      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
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

    it("copies the trigger's scoped data-theme onto the overlay host", async () => {
      fixture.nativeElement.setAttribute('data-theme', 'cyberpunk');
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const host = document.body.querySelector('.gog-overlay-host') as HTMLElement;
      expect(host.getAttribute('data-theme')).toBe('cyberpunk');
    });

    it('reuses the trigger-relative placement for the appended panel', async () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      expect(panel.classList.contains('gog-select__dropdown--portal')).toBe(true);
      // Coordinates are resolved in TS and written as inline styles; jsdom reports a
      // zero-sized trigger, so the assertion is only that they were applied at all.
      expect(panel.style.top).not.toBe('');
      expect(panel.style.width).not.toBe('');
    });

    it('lets dropdownWidth/dropdownMaxHeight override the computed panel size', async () => {
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.componentRef.setInput('dropdownWidth', '320px');
      fixture.componentRef.setInput('dropdownMaxHeight', '20%');
      fixture.detectChanges();
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      expect(panel.style.width).toBe('320px');
      expect(panel.style.maxHeight).toBe('20%');
    });

    // Regression: placement used to be measured from the whole `<gog-select>` host —
    // label and error included — rather than the trigger itself, so a label above the
    // control shrank the perceived space above it and could push the panel to overlap
    // the control when opening upward.
    it('positions the appended panel relative to the trigger, not the label around it', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('appendToBody', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      const host = fixture.nativeElement.querySelector('.gog-select') as HTMLElement;

      // The host's rect starts well above the trigger's — exactly what a `<label>` stacked
      // above the `<button>` produces in a real layout.
      stubRect(control, { top: 140, bottom: 180, left: 20, width: 200 });
      stubRect(host, { top: 100, bottom: 220, left: 20, width: 200 });

      control.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      // Down direction: top follows the trigger's bottom (180) + the panel gap (2), not
      // the host's.
      expect(panel.style.top).toBe('182px');
    });

    // A dropdown inside a dialog is stacked by the dialog setting --gog-dropdown-z on its
    // panel. An appended dropdown leaves that subtree, so the value has to be carried
    // over explicitly or the panel renders behind the dialog that opened it.
    it('carries an inherited --gog-dropdown-z onto the appended panel', async () => {
      @Component({
        imports: [SelectComponent],
        template: `
          <div [style.--gog-dropdown-z]="1500">
            <gog-select [options]="options" [appendToBody]="true" />
          </div>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class StackingHostComponent {
        readonly options = [{ id: 'a', name: 'Alpha' }];
      }

      const hostFixture = TestBed.createComponent(StackingHostComponent);
      await hostFixture.whenStable();

      (
        hostFixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement
      ).click();
      await hostFixture.whenStable();

      const panel = document.body.querySelector('[role="listbox"]') as HTMLElement;
      expect(panel.style.zIndex).toBe('1500');
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

      const portalOption = document.body.querySelector(
        '[role="listbox"] .gog-select__option',
      ) as HTMLButtonElement;
      portalOption.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.value()).toBe('a');
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      imports: [SelectComponent, ReactiveFormsModule],
      template: `
        <gog-select
          [formControl]="control"
          [options]="options"
          errorMessage="Selection required"
          errorDisplay="auto"
        />
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SelectFormHostComponent {
      readonly control = new FormControl<string | number | null>(null, Validators.required);
      readonly options = [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ];
    }

    let hostFixture: ComponentFixture<SelectFormHostComponent>;
    let host: SelectFormHostComponent;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(SelectFormHostComponent);
      host = hostFixture.componentInstance;
      await hostFixture.whenStable();
    });

    it('applies values written to the FormControl', async () => {
      host.control.setValue('b');
      await hostFixture.whenStable();

      const value = hostFixture.nativeElement.querySelector('.gog-select__value') as HTMLElement;
      expect(value.textContent?.trim()).toBe('Beta');
    });

    it('propagates a selection to the FormControl value', async () => {
      (
        hostFixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement
      ).click();
      await hostFixture.whenStable();

      (hostFixture.nativeElement.querySelector('.gog-select__option') as HTMLButtonElement).click();
      await hostFixture.whenStable();

      expect(host.control.value).toBe('a');
    });

    it('marks the FormControl as touched once the dropdown closes', async () => {
      expect(host.control.touched).toBe(false);

      const control = hostFixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      await hostFixture.whenStable();
      control.click();
      await hostFixture.whenStable();

      expect(host.control.touched).toBe(true);
    });

    it('disables the trigger when the FormControl is disabled', async () => {
      host.control.disable();
      await hostFixture.whenStable();

      const control = hostFixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      expect(control.disabled).toBe(true);
    });

    // With `errorDisplay="auto"` the error follows the control rather than the bare
    // presence of `errorMessage`, so a pristine invalid field stays quiet.
    it('withholds the error until the control has been touched', async () => {
      expect(host.control.invalid).toBe(true);
      expect(hostFixture.nativeElement.querySelector('.gog-select__error')).toBeNull();

      const control = hostFixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.click();
      await hostFixture.whenStable();
      control.click();
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-select__error')?.textContent).toContain(
        'Selection required',
      );
    });
  });

  describe('errorDisplay', () => {
    // Default is 'manual' — the same contract as every other control in the library —
    // even when a FormControl happens to be attached, so attaching reactive forms doesn't
    // silently change how `errorMessage` behaves unless a consumer opts into 'auto'.
    it('defaults to manual even with a FormControl attached, showing the error immediately', async () => {
      @Component({
        imports: [SelectComponent, ReactiveFormsModule],
        template: `
          <gog-select
            [formControl]="control"
            [options]="options"
            errorMessage="Selection required"
          />
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class DefaultErrorDisplayHostComponent {
        readonly control = new FormControl<string | number | null>(null, Validators.required);
        readonly options = [{ id: 'a', name: 'Alpha' }];
      }

      const hostFixture = TestBed.createComponent(DefaultErrorDisplayHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.control.touched).toBe(false);
      expect(hostFixture.nativeElement.querySelector('.gog-select__error')?.textContent).toContain(
        'Selection required',
      );
    });
  });

  describe('floatLabel', () => {
    it('defaults to none — no float-label markup, and the placeholder passes through unchanged', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('placeholder', 'Pick a region');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select__label--float')).toBeNull();
      expect(fixture.nativeElement.querySelector('.gog-select__value')?.textContent.trim()).toBe(
        'Pick a region',
      );
    });

    it('renders the float label and hides the placeholder once a variant is set', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('placeholder', 'Pick a region');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      const floatLabel = fixture.nativeElement.querySelector(
        '.gog-select__label--float',
      ) as HTMLElement;
      expect(floatLabel.textContent).toBe('Region');
      expect(floatLabel.id).toBeTruthy();
      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      expect(control.getAttribute('aria-labelledby')).toBe(floatLabel.id);
      expect(fixture.nativeElement.querySelector('.gog-select__value')?.textContent.trim()).toBe(
        '',
      );
    });

    it('instance floatLabel input wins over GOG_CONFIG.floatLabel.variant', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SelectComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'over' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(SelectComponent);
      providedFixture.componentRef.setInput('label', 'Region');
      providedFixture.componentRef.setInput('floatLabel', 'in');
      await providedFixture.whenStable();

      expect(
        providedFixture.nativeElement.querySelector('.gog-select').classList,
      ).toContain('gog-select--float-in');
    });

    it('falls back to GOG_CONFIG.floatLabel.variant when the instance input is unset', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SelectComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'on' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(SelectComponent);
      providedFixture.componentRef.setInput('label', 'Region');
      await providedFixture.whenStable();

      expect(
        providedFixture.nativeElement.querySelector('.gog-select').classList,
      ).toContain('gog-select--float-on');
    });

    it('marks the field as floated once a value is selected, even without focus', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('floatLabel', 'in');
      fixture.componentRef.setInput('options', [{ id: 'a', name: 'Alpha' }]);
      fixture.componentRef.setInput('value', 'a');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-select').classList).toContain(
        'gog-select--floated',
      );
    });

    it('marks the field as floated on focus and unfloats on blur when still empty', async () => {
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      const control = fixture.nativeElement.querySelector(
        '.gog-select__control',
      ) as HTMLButtonElement;
      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-select').classList).toContain(
        'gog-select--floated',
      );

      control.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-select').classList).not.toContain(
        'gog-select--floated',
      );
    });

    describe('floatLabelShowPlaceholder', () => {
      it('keeps the placeholder hidden at rest even when true, and reveals it once floated', async () => {
        fixture.componentRef.setInput('label', 'Region');
        fixture.componentRef.setInput('placeholder', 'Pick a region');
        fixture.componentRef.setInput('floatLabel', 'in');
        fixture.componentRef.setInput('floatLabelShowPlaceholder', true);
        await fixture.whenStable();

        expect(
          fixture.nativeElement.querySelector('.gog-select__value')?.textContent.trim(),
        ).toBe('');

        const control = fixture.nativeElement.querySelector(
          '.gog-select__control',
        ) as HTMLButtonElement;
        control.dispatchEvent(new Event('focus'));
        await fixture.whenStable();

        expect(
          fixture.nativeElement.querySelector('.gog-select__value')?.textContent.trim(),
        ).toBe('Pick a region');
      });
    });
  });
});
