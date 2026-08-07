import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RadioGroupComponent, type GogRadioOption } from './radio-group.component';

const OPTIONS: GogRadioOption[] = [
  { id: 'a', label: 'Option A' },
  { id: 'b', label: 'Option B' },
  { id: 'c', label: 'Option C', disabled: true },
];

describe('RadioGroupComponent', () => {
  let component: RadioGroupComponent;
  let fixture: ComponentFixture<RadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the option whose native radio changes to checked', () => {
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    const first = inputs[0] as HTMLInputElement;
    first.checked = true;
    first.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.value()).toBe('a');
  });

  it('should share one name across every option so only one can be checked at a time', () => {
    fixture.detectChanges();

    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    const names = new Set(inputs.map((input) => input.name));

    expect(names.size).toBe(1);
  });

  it('should render disabled attribute for an option-level disabled flag even when the group is enabled', () => {
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    const disabledInput = inputs[2] as HTMLInputElement;
    expect(disabledInput.disabled).toBe(true);
  });

  it('should not update value() when a disabled option receives a change event', () => {
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    const disabledInput = inputs[2] as HTMLInputElement;
    disabledInput.checked = true;
    disabledInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.value()).toBe(null);
  });

  describe('disabled (group-level)', () => {
    it('should disable every native radio and apply the disabled visual class', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const inputs = Array.from(
        fixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(inputs.every((input) => input.disabled)).toBe(true);
      expect(
        fixture.nativeElement
          .querySelector('.gog-radio-group')
          .classList.contains('gog-radio-group--disabled'),
      ).toBe(true);
    });
  });

  describe('fullWidth', () => {
    it('should apply the full-width host class so the stylesheet rules take effect', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(true);
    });

    it('should not apply the full-width host class by default', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(false);
    });
  });

  describe('two-way [(value)] binding', () => {
    // The bound state is a signal, not a plain field: under the zoneless test setup a
    // plain-field write never marks the host view dirty, so change detection only picks
    // it up in the dev-mode verification pass and throws NG0100.
    @Component({
      imports: [RadioGroupComponent],
      template: ` <gog-radio-group [options]="options" [(value)]="selected" label="Pick one" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class RadioGroupHostComponent {
      readonly options = OPTIONS;
      readonly selected = signal<string | number | null>(null);
    }

    it('should propagate a selection back out to the bound signal', async () => {
      const hostFixture = TestBed.createComponent(RadioGroupHostComponent);
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.selected()).toBe('a');
    });

    it('should reflect external writes to the bound signal in the DOM', async () => {
      const hostFixture = TestBed.createComponent(RadioGroupHostComponent);
      await hostFixture.whenStable();

      hostFixture.componentInstance.selected.set('b');
      await hostFixture.whenStable();

      const inputs = Array.from(
        hostFixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(inputs.find((input) => input.checked)?.value).toBe('b');
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      standalone: true,
      imports: [RadioGroupComponent, ReactiveFormsModule],
      template: ` <gog-radio-group [options]="options" [formControl]="control" label="Pick one" />`,
    })
    class RadioGroupFormHostComponent {
      options = OPTIONS;
      control = new FormControl<string | number | null>(null);
    }

    let hostFixture: ComponentFixture<RadioGroupFormHostComponent>;
    let host: RadioGroupFormHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(RadioGroupFormHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should apply values written to the FormControl via writeValue', () => {
      host.control.setValue('b');
      hostFixture.detectChanges();

      const inputs = Array.from(
        hostFixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(inputs.find((input) => input.checked)?.value).toBe('b');
    });

    it('should propagate a user selection to the FormControl value', () => {
      const input = hostFixture.nativeElement.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      hostFixture.detectChanges();

      expect(host.control.value).toBe('a');
    });

    it('should mark the FormControl as touched on blur', () => {
      expect(host.control.touched).toBe(false);

      const input = hostFixture.nativeElement.querySelector('input[type="radio"]') as HTMLElement;
      input.dispatchEvent(new Event('blur'));
      hostFixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });

    it('should disable every native radio when the FormControl is disabled', () => {
      host.control.disable();
      hostFixture.detectChanges();

      const inputs = Array.from(
        hostFixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(inputs.every((input) => input.disabled)).toBe(true);
    });

    it('should re-enable every native radio when the FormControl is enabled again', () => {
      host.control.disable();
      hostFixture.detectChanges();
      host.control.enable();
      hostFixture.detectChanges();

      const inputs = Array.from(
        hostFixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      // The option-level disabled flag on 'c' still applies independently of the form control.
      expect(inputs[0].disabled).toBe(false);
      expect(inputs[1].disabled).toBe(false);
      expect(inputs[2].disabled).toBe(true);
    });

    it('should not propagate changes to the FormControl while it is disabled', () => {
      host.control.disable();
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement;
      // jsdom still allows toggling `checked` on a disabled input via script, matching a
      // programmatic change; the guard under test is `isOptionDisabled`, not the browser.
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      hostFixture.detectChanges();

      expect(host.control.value).toBe(null);
    });
  });
});
