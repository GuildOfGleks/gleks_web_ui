import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ButtonToggleGroupComponent } from './button-toggle.component';

interface View {
  id: string;
  name: string;
  disabled?: boolean;
}

const VIEWS: View[] = [
  { id: 'list', name: 'Список' },
  { id: 'grid', name: 'Плитка' },
  { id: 'map', name: 'Карта', disabled: true },
  { id: 'chart', name: 'График' },
];

type DefaultGroup = ButtonToggleGroupComponent<View, string>;

describe('ButtonToggleGroupComponent', () => {
  let fixture: ComponentFixture<DefaultGroup>;
  let component: DefaultGroup;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function buttons(): HTMLButtonElement[] {
    return Array.from(host().querySelectorAll('button'));
  }

  function keydown(key: string, target: HTMLElement): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent<DefaultGroup>(ButtonToggleGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', VIEWS);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render one button per option', () => {
    expect(buttons().length).toBe(4);
    expect(buttons()[0].textContent?.trim()).toBe('Список');
  });

  it('should be a radiogroup in single mode', () => {
    expect(host().getAttribute('role')).toBe('radiogroup');
    expect(buttons()[0].getAttribute('role')).toBe('radio');
    expect(buttons()[0].getAttribute('aria-checked')).toBe('false');
    // aria-pressed is the *toggle* contract and must not appear on a radio.
    expect(buttons()[0].getAttribute('aria-pressed')).toBeNull();
  });

  it('should be a group of toggles in multiple mode', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    expect(host().getAttribute('role')).toBe('group');
    expect(buttons()[0].getAttribute('role')).toBeNull();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons()[0].getAttribute('aria-checked')).toBeNull();
  });

  it('should select on click and emit the option value', () => {
    buttons()[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('grid');
    expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
    expect(buttons()[1].classList.contains('gog-button-toggle__button--selected')).toBe(true);
  });

  it('should replace the selection in single mode', () => {
    buttons()[0].click();
    fixture.detectChanges();
    buttons()[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('grid');
  });

  it('should accumulate a selection array in multiple mode', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    buttons()[0].click();
    fixture.detectChanges();
    buttons()[1].click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['list', 'grid']);
  });

  it('should deselect an already-selected option in multiple mode', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    buttons()[0].click();
    fixture.detectChanges();
    buttons()[0].click();
    fixture.detectChanges();

    expect(component.value()).toEqual([]);
  });

  it('should not select a disabled option', () => {
    buttons()[2].click();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(buttons()[2].disabled).toBe(true);
  });

  it('should disable every option when the group is disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(host().getAttribute('aria-disabled')).toBe('true');
  });

  it('should emit the option object itself when optionValue is null', () => {
    fixture.componentRef.setInput('optionValue', null);
    fixture.detectChanges();

    buttons()[1].click();
    fixture.detectChanges();

    // The same reference the consumer passed in — that is the whole point of the accessor API.
    expect(component.value()).toBe(VIEWS[1]);
  });

  it('should read labels through a function accessor', () => {
    fixture.componentRef.setInput('optionLabel', (view: View) => view.name.toUpperCase());
    fixture.detectChanges();

    expect(buttons()[0].textContent?.trim()).toBe('СПИСОК');
  });

  describe('roving tabindex', () => {
    it('should expose exactly one tab stop', () => {
      expect(buttons().filter((button) => button.tabIndex === 0).length).toBe(1);
    });

    it('should put the tab stop on the first enabled option when nothing is selected', () => {
      expect(buttons()[0].tabIndex).toBe(0);
    });

    it('should move the tab stop onto the selection', () => {
      buttons()[1].click();
      fixture.detectChanges();

      expect(buttons()[1].tabIndex).toBe(0);
      expect(buttons()[0].tabIndex).toBe(-1);
    });
  });

  describe('keyboard', () => {
    it('should move and select with ArrowRight in single mode', () => {
      buttons()[0].focus();
      keydown('ArrowRight', buttons()[0]);
      fixture.detectChanges();

      // A radio group selects as it moves — that is the contract role="radio" promises.
      expect(document.activeElement).toBe(buttons()[1]);
      expect(component.value()).toBe('grid');
    });

    it('should skip a disabled option', () => {
      buttons()[1].focus();
      keydown('ArrowRight', buttons()[1]);
      fixture.detectChanges();

      // index 2 is disabled, so it lands on 3.
      expect(document.activeElement).toBe(buttons()[3]);
      expect(component.value()).toBe('chart');
    });

    it('should move without selecting in multiple mode', () => {
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();

      buttons()[0].focus();
      keydown('ArrowRight', buttons()[0]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(buttons()[1]);
      expect(component.value()).toBeNull();
    });

    it('should ignore the vertical arrows while horizontal', () => {
      buttons()[0].focus();
      keydown('ArrowDown', buttons()[0]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(buttons()[0]);
    });

    it('should use the vertical arrows when the group is vertical', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();

      buttons()[0].focus();
      keydown('ArrowDown', buttons()[0]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(buttons()[1]);
    });

    it('should wrap from the last option back to the first', () => {
      buttons()[3].focus();
      keydown('ArrowRight', buttons()[3]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(buttons()[0]);
    });
  });

  it('should map appearance, orientation and size to classes', () => {
    fixture.componentRef.setInput('appearance', 'separated');
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    expect(host().classList.contains('gog-button-toggle--separated')).toBe(true);
    expect(host().classList.contains('gog-button-toggle--vertical')).toBe(true);
    expect(host().classList.contains('gog-button-toggle--sm')).toBe(true);
  });
});

@Component({
  imports: [ButtonToggleGroupComponent, ReactiveFormsModule],
  template: `
    <gog-button-toggle-group [formControl]="control" [options]="views()" ariaLabel="Вид" />
  `,
})
class ReactiveHost {
  readonly control = new FormControl<string | null>('grid');
  readonly views = signal(VIEWS);
}

describe('ButtonToggleGroupComponent — Reactive Forms', () => {
  let fixture: ComponentFixture<ReactiveHost>;
  let hostComponent: ReactiveHost;

  function buttons(): HTMLButtonElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
    fixture = TestBed.createComponent(ReactiveHost);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should reflect the control value as the initial selection', () => {
    expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
  });

  it('should push a click back into the control', () => {
    buttons()[0].click();
    fixture.detectChanges();

    expect(hostComponent.control.value).toBe('list');
  });

  it('should honour the control being disabled', async () => {
    hostComponent.control.disable();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(buttons().every((button) => button.disabled)).toBe(true);
  });

  it('should mark the control touched on blur', () => {
    buttons()[0].dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hostComponent.control.touched).toBe(true);
  });
});
