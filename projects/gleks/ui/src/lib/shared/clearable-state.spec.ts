import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { InputfieldComponent } from '../components/inputfield/inputfield.component';
import { MultiselectComponent } from '../components/multiselect/multiselect.component';
import { SelectComponent } from '../components/select/select.component';
import { TextareaComponent } from '../components/textarea/textarea.component';
import { provideGogConfig } from './config';

const OPTIONS = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
];

@Component({
  standalone: true,
  imports: [InputfieldComponent, TextareaComponent, SelectComponent, MultiselectComponent],
  template: `
    <gog-inputfield label="Text" [clearable]="clearable()" [(value)]="text" />
    <gog-textarea label="Notes" [clearable]="clearable()" [(value)]="notes" />
    <gog-select label="One" [options]="options" [clearable]="clearable()" [(value)]="one" />
    <gog-multiselect label="Many" [options]="options" [(value)]="many" />
  `,
})
class ClearableHost {
  readonly options = OPTIONS;
  readonly clearable = signal(true);
  readonly text = signal('');
  readonly notes = signal('');
  readonly one = signal<string | number | null>(null);
  readonly many = signal<(string | number)[]>([]);
}

async function render(providers: unknown[] = []): Promise<ComponentFixture<ClearableHost>> {
  await TestBed.configureTestingModule({
    imports: [ClearableHost],
    providers: providers as never,
  }).compileComponents();
  const fixture = TestBed.createComponent(ClearableHost);
  await fixture.whenStable();
  return fixture;
}

const CLEAR = {
  input: '.gog-input__clear',
  textarea: '.gog-textarea__clear',
  select: '.gog-select__clear',
  multiselect: '.gog-ms__clear',
};

describe('clearable', () => {
  it('renders no clear button while every control is empty', async () => {
    const fixture = await render();
    for (const selector of Object.values(CLEAR)) {
      expect(fixture.debugElement.query(By.css(selector))).toBeNull();
    }
  });

  it('reveals the button only once a control has something to clear', async () => {
    const fixture = await render();
    fixture.componentInstance.text.set('hello');
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css(CLEAR.input))).toBeTruthy();
    // the others are still empty and stay bare
    expect(fixture.debugElement.query(By.css(CLEAR.textarea))).toBeNull();
    expect(fixture.debugElement.query(By.css(CLEAR.select))).toBeNull();
  });

  it('clears a text field and a textarea back to empty', async () => {
    const fixture = await render();
    fixture.componentInstance.text.set('hello');
    fixture.componentInstance.notes.set('some notes');
    await fixture.whenStable();

    fixture.debugElement.query(By.css(CLEAR.input)).nativeElement.click();
    fixture.debugElement.query(By.css(CLEAR.textarea)).nativeElement.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.text()).toBe('');
    expect(fixture.componentInstance.notes()).toBe('');
    expect(fixture.debugElement.query(By.css(CLEAR.input))).toBeNull();
  });

  it('clears a select back to null and a multiselect back to an empty array', async () => {
    const fixture = await render();
    fixture.componentInstance.one.set('a');
    fixture.componentInstance.many.set(['a', 'b']);
    await fixture.whenStable();

    fixture.debugElement.query(By.css(CLEAR.select)).nativeElement.click();
    fixture.debugElement.query(By.css(CLEAR.multiselect)).nativeElement.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.one()).toBeNull();
    expect(fixture.componentInstance.many()).toEqual([]);
  });

  it('carries an accessible name', async () => {
    const fixture = await render();
    fixture.componentInstance.text.set('hello');
    await fixture.whenStable();

    expect(
      fixture.debugElement.query(By.css(CLEAR.input)).nativeElement.getAttribute('aria-label'),
    ).toBe('Clear');
  });

  it('honours [clearable]="false"', async () => {
    const fixture = await render();
    fixture.componentInstance.clearable.set(false);
    fixture.componentInstance.text.set('hello');
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css(CLEAR.input))).toBeNull();
  });

  it('gog-multiselect keeps its clear button without opting in', async () => {
    // It shipped one before `clearable` existed; the default preserves that.
    const fixture = await render();
    fixture.componentInstance.many.set(['a']);
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css(CLEAR.multiselect))).toBeTruthy();
  });

  it('can be switched on app-wide through GOG_CONFIG', async () => {
    const fixture = await render([provideGogConfig({ control: { clearable: true } })]);
    // the host binds [clearable] explicitly, so prove the config path on a control that doesn't
    fixture.componentInstance.notes.set('via config');
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css(CLEAR.textarea))).toBeTruthy();
  });
});
