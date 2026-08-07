import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ToggleComponent } from './toggle.component';
import { GOG_CONFIG } from '../../shared/config';

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(): HTMLInputElement {
    return host().querySelector('input')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a native checkbox carrying role="switch"', () => {
    // The role is the whole reason this exists next to gog-checkbox: it announces as
    // "switch, on" rather than "checkbox, checked", while the platform still owns the
    // keyboard and form behaviour.
    expect(input().type).toBe('checkbox');
    expect(input().getAttribute('role')).toBe('switch');
  });

  it('should default to off, md, label at the end', () => {
    expect(component.checked()).toBe(false);
    expect(input().checked).toBe(false);
    expect(host().classList.contains('gog-toggle-host--md')).toBe(true);
    expect(host().classList.contains('gog-toggle-host--label-end')).toBe(true);
  });

  it('should reflect checked state onto the track', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    expect(input().checked).toBe(true);
    expect(host().querySelector('.gog-toggle__track')?.classList).toContain(
      'gog-toggle__track--on',
    );
  });

  it('should update the model when the native input changes', () => {
    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
  });

  it('should not change when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(input().disabled).toBe(true);
    expect(host().querySelector('.gog-toggle')?.classList).toContain('gog-toggle--disabled');
  });

  it('should render the label, and use ariaLabel only without one', () => {
    fixture.componentRef.setInput('ariaLabel', 'Тёмная тема');
    fixture.detectChanges();
    expect(input().getAttribute('aria-label')).toBe('Тёмная тема');

    fixture.componentRef.setInput('label', 'Тёмная тема');
    fixture.detectChanges();
    expect(host().querySelector('.gog-toggle__label')?.textContent?.trim()).toBe('Тёмная тема');
    // The visible label already names it; a second aria-label would win over it and hide the
    // wording the user can actually see.
    expect(input().getAttribute('aria-label')).toBeNull();
  });

  it('should render no track labels unless one is given', () => {
    expect(host().querySelectorAll('.gog-toggle__state').length).toBe(0);
    expect(host().classList.contains('gog-toggle-host--track-labels')).toBe(false);
  });

  it('should keep both track labels in the DOM so the width cannot jump', () => {
    fixture.componentRef.setInput('onLabel', 'ВКЛ');
    fixture.componentRef.setInput('offLabel', 'ВЫКЛ');
    fixture.detectChanges();

    const states = host().querySelectorAll('.gog-toggle__state');
    expect(states.length).toBe(2);
    expect(host().classList.contains('gog-toggle-host--track-labels')).toBe(true);
    // Off by default, so the "off" wording is the active one.
    expect(
      host()
        .querySelector('.gog-toggle__state--off')
        ?.classList.contains('gog-toggle__state--active'),
    ).toBe(true);
    expect(
      host()
        .querySelector('.gog-toggle__state--on')
        ?.classList.contains('gog-toggle__state--active'),
    ).toBe(false);
  });

  it('should move the label to the start when asked', () => {
    fixture.componentRef.setInput('labelPosition', 'start');
    fixture.detectChanges();

    expect(host().classList.contains('gog-toggle-host--label-start')).toBe(true);
    expect(host().classList.contains('gog-toggle-host--label-end')).toBe(false);
  });

  it('should map size to its class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host().classList.contains('gog-toggle-host--lg')).toBe(true);
  });
});

describe('ToggleComponent — GOG_CONFIG', () => {
  it('should take control.size from the global config when the input is unset', async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
      providers: [{ provide: GOG_CONFIG, useValue: { control: { size: 'sm' } } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ToggleComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('gog-toggle-host--sm')).toBe(
      true,
    );
  });

  it('should let the instance input win over the global config', async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
      providers: [{ provide: GOG_CONFIG, useValue: { control: { size: 'sm' } } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ToggleComponent);
    fixture.componentRef.setInput('size', 'lg');
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('gog-toggle-host--lg')).toBe(
      true,
    );
  });
});

@Component({
  imports: [ToggleComponent, ReactiveFormsModule],
  template: `<gog-toggle [formControl]="control" label="Уведомления" />`,
})
class ReactiveHost {
  readonly control = new FormControl(false);
  readonly touched = signal(false);
}

describe('ToggleComponent — Reactive Forms', () => {
  let fixture: ComponentFixture<ReactiveHost>;
  let hostComponent: ReactiveHost;

  function input(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
    fixture = TestBed.createComponent(ReactiveHost);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should write the control value into the switch', async () => {
    hostComponent.control.setValue(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input().checked).toBe(true);
  });

  it('should push changes back into the control', () => {
    input().checked = true;
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(hostComponent.control.value).toBe(true);
  });

  it('should honour the control being disabled', async () => {
    hostComponent.control.disable();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input().disabled).toBe(true);
  });

  it('should mark the control touched on blur', () => {
    expect(hostComponent.control.touched).toBe(false);

    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hostComponent.control.touched).toBe(true);
  });
});
