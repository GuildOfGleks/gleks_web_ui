import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { MultiselectComponent } from '../components/multiselect/multiselect.component';
import { SelectComponent } from '../components/select/select.component';

const FRUIT = [
  { id: 'ap', name: 'Apple' },
  { id: 'ba', name: 'Banana' },
  { id: 'ch', name: 'Cherry' },
  { id: 'gr', name: 'Grape' },
];

@Component({
  standalone: true,
  imports: [SelectComponent],
  template: `
    <gog-select
      label="Fruit"
      [options]="fruit"
      [filter]="true"
      [filterMatch]="match()"
      [filterPosition]="position()"
      filterEmptyMessage="Nothing here"
      [(value)]="picked"
    />
  `,
})
class FilterSelectHost {
  readonly fruit = FRUIT;
  readonly picked = signal<string | number | null>(null);
  readonly match = signal<((o: { name: string }, q: string) => boolean) | null>(null);
  readonly position = signal<'top' | 'bottom'>('top');
}

@Component({
  standalone: true,
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect
      label="Fruit"
      [options]="fruit"
      [filter]="true"
      [showControls]="true"
      [(value)]="picked"
    />
  `,
})
class FilterMultiselectHost {
  readonly fruit = FRUIT;
  readonly picked = signal<(string | number)[]>([]);
}

async function open<T>(host: new () => T, trigger: string): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  fixture.debugElement.query(By.css(trigger)).nativeElement.click();
  await fixture.whenStable();
  return fixture;
}

async function type(fixture: ComponentFixture<unknown>, selector: string, text: string) {
  const input = fixture.debugElement.query(By.css(selector)).nativeElement as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

const labels = (fixture: ComponentFixture<unknown>, selector: string) =>
  fixture.debugElement.queryAll(By.css(selector)).map((el) => el.nativeElement.textContent.trim());

describe('dropdown filter', () => {
  describe('gog-select', () => {
    it('narrows the option list case-insensitively on the resolved label', async () => {
      const fixture = await open(FilterSelectHost, '.gog-select__control');
      expect(labels(fixture, '.gog-select__option-label')).toHaveLength(4);

      await type(fixture, '.gog-select__filter-input', 'AP');

      expect(labels(fixture, '.gog-select__option-label')).toEqual(['Apple', 'Grape']);
    });

    it('shows the empty message when nothing matches', async () => {
      const fixture = await open(FilterSelectHost, '.gog-select__control');
      await type(fixture, '.gog-select__filter-input', 'zzz');

      expect(fixture.debugElement.queryAll(By.css('.gog-select__option'))).toHaveLength(0);
      expect(
        fixture.debugElement.query(By.css('.gog-select__empty')).nativeElement.textContent.trim(),
      ).toBe('Nothing here');
    });

    it('uses a custom filterMatch when one is supplied', async () => {
      const fixture = await open(FilterSelectHost, '.gog-select__control');
      // prefix-only matching instead of the default substring
      fixture.componentInstance.match.set((o, q) =>
        o.name.toLowerCase().startsWith(q.toLowerCase()),
      );
      await type(fixture, '.gog-select__filter-input', 'ap');

      expect(labels(fixture, '.gog-select__option-label')).toEqual(['Apple']);
    });

    it('sticks the filter to the requested end of the panel', async () => {
      const fixture = await open(FilterSelectHost, '.gog-select__control');
      expect(fixture.debugElement.query(By.css('.gog-select__filter--top'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.gog-select__filter--bottom'))).toBeNull();

      fixture.componentInstance.position.set('bottom');
      await fixture.whenStable();

      expect(fixture.debugElement.query(By.css('.gog-select__filter--top'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.gog-select__filter--bottom'))).toBeTruthy();
    });

    it('forgets the query when the panel closes', async () => {
      const fixture = await open(FilterSelectHost, '.gog-select__control');
      await type(fixture, '.gog-select__filter-input', 'ap');

      const trigger = fixture.debugElement.query(By.css('.gog-select__control')).nativeElement;
      trigger.click(); // close
      await fixture.whenStable();
      trigger.click(); // reopen
      await fixture.whenStable();

      expect(labels(fixture, '.gog-select__option-label')).toHaveLength(4);
    });
  });

  describe('gog-multiselect', () => {
    it('narrows the list and keeps selecting from it working', async () => {
      const fixture = await open(FilterMultiselectHost, '.gog-ms');
      await type(fixture, '.gog-ms__filter-input', 'an');

      expect(labels(fixture, '.gog-ms__option')).toEqual(['Banana']);

      fixture.debugElement.query(By.css('.gog-ms__option')).nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.picked()).toEqual(['ba']);
    });

    it('select-all takes only the visible options while a filter is active', async () => {
      const fixture = await open(FilterMultiselectHost, '.gog-ms');
      await type(fixture, '.gog-ms__filter-input', 'ap');

      const selectAll = fixture.debugElement
        .queryAll(By.css('.gog-ms__controls gog-button button'))
        .at(0);
      selectAll?.nativeElement.click();
      await fixture.whenStable();

      // "Apple" and "Grape" match 'ap'; Banana and Cherry must stay unselected
      expect(fixture.componentInstance.picked()).toEqual(['ap', 'gr']);
    });
  });
});
