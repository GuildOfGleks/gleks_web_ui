import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { MultiselectComponent } from '../components/multiselect/multiselect.component';
import { SelectComponent } from '../components/select/select.component';
import { GogDropdownOptionDirective } from './dropdown-base';
import { getByPath, isSameOptionValue, readOption } from './option-accessor';

/** A consumer's own DTO — no `id`, no `name`, and a nested field. */
interface User {
  uuid: string;
  profile: { fullName: string };
  suspended: boolean;
}

const USERS: User[] = [
  { uuid: 'u1', profile: { fullName: 'Ada Lovelace' }, suspended: false },
  { uuid: 'u2', profile: { fullName: 'Alan Turing' }, suspended: true },
];

@Component({
  standalone: true,
  imports: [SelectComponent],
  template: `
    <gog-select
      [options]="users"
      optionLabel="profile.fullName"
      optionValue="uuid"
      optionDisabled="suspended"
      [(value)]="selected"
    />
  `,
})
class DtoSelectHost {
  readonly users = USERS;
  readonly selected = signal<string | null>(null);
}

@Component({
  standalone: true,
  imports: [SelectComponent],
  template: `
    <gog-select [options]="users" [optionLabel]="label" [optionValue]="null" [(value)]="selected" />
  `,
})
class WholeObjectSelectHost {
  readonly users = USERS;
  readonly label = (user: User) => user.profile.fullName;
  readonly selected = signal<User | null>(null);
}

@Component({
  standalone: true,
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect
      [options]="users"
      optionLabel="profile.fullName"
      optionValue="uuid"
      optionDisabled="suspended"
      [(value)]="selected"
    />
  `,
})
class DtoMultiselectHost {
  readonly users = USERS;
  readonly selected = signal<string[]>([]);
}

@Component({
  standalone: true,
  imports: [SelectComponent, GogDropdownOptionDirective],
  template: `
    <gog-select [options]="users" optionLabel="profile.fullName" optionValue="uuid">
      <ng-template gogDropdownOption let-user let-selected="selected" let-label="label">
        <b class="custom-option" [class.is-selected]="selected"
          >{{ label }}/{{ $any(user).uuid }}</b
        >
      </ng-template>
    </gog-select>
  `,
})
class OptionSlotHost {
  readonly users = USERS;
}

async function render<T>(host: new () => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  return fixture;
}

describe('option accessors', () => {
  describe('helpers', () => {
    it('getByPath follows dot-paths and stops at a null link', () => {
      expect(getByPath({ a: { b: 'x' } }, 'a.b')).toBe('x');
      expect(getByPath({ a: null }, 'a.b')).toBeUndefined();
      expect(getByPath({ a: 1 }, 'a')).toBe(1);
    });

    it('readOption accepts a path or a function', () => {
      expect(readOption({ n: 'x' }, 'n')).toBe('x');
      expect(readOption({ n: 'x' }, (o: { n: string }) => o.n.toUpperCase())).toBe('X');
    });

    it('isSameOptionValue compares primitives loosely and objects by identity', () => {
      // a formControl holding '1' still matches an option whose value is the number 1
      expect(isSameOptionValue(1, '1')).toBe(true);
      expect(isSameOptionValue('a', 'a')).toBe(true);
      expect(isSameOptionValue(null, undefined)).toBe(false);

      const obj = { x: 1 };
      expect(isSameOptionValue(obj, obj)).toBe(true);
      // without the identity rule these would both coerce to "[object Object]"
      expect(isSameOptionValue(obj, { x: 1 })).toBe(false);
    });
  });

  describe('gog-select with a consumer DTO', () => {
    it('labels options through a nested path', async () => {
      const fixture = await render(DtoSelectHost);
      const options = fixture.debugElement.queryAll(By.css('.gog-select__option-label'));
      // panel only renders when open, so drive the trigger first
      expect(options.length === 0 || options[0].nativeElement.textContent.trim()).toBeTruthy();

      fixture.debugElement.query(By.css('.gog-select__control')).nativeElement.click();
      await fixture.whenStable();

      const labels = fixture.debugElement
        .queryAll(By.css('.gog-select__option-label'))
        .map((el) => el.nativeElement.textContent.trim());
      expect(labels).toEqual(['Ada Lovelace', 'Alan Turing']);
    });

    it('emits the value read through optionValue, and honours optionDisabled', async () => {
      const fixture = await render(DtoSelectHost);
      fixture.debugElement.query(By.css('.gog-select__control')).nativeElement.click();
      await fixture.whenStable();

      const options = fixture.debugElement.queryAll(By.css('.gog-select__option'));
      expect(options[1].nativeElement.getAttribute('aria-disabled')).toBe('true');

      options[0].nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.selected()).toBe('u1');
    });
  });

  it('emits the option object itself when optionValue is null', async () => {
    const fixture = await render(WholeObjectSelectHost);
    fixture.debugElement.query(By.css('.gog-select__control')).nativeElement.click();
    await fixture.whenStable();

    fixture.debugElement.queryAll(By.css('.gog-select__option'))[0].nativeElement.click();
    await fixture.whenStable();

    // the consumer's own object, not a copy and not an id
    expect(fixture.componentInstance.selected()).toBe(USERS[0]);
  });

  it('gog-multiselect resolves labels and values through the accessors', async () => {
    const fixture = await render(DtoMultiselectHost);
    fixture.debugElement.query(By.css('.gog-ms')).nativeElement.click();
    await fixture.whenStable();

    fixture.debugElement.queryAll(By.css('.gog-ms__option'))[0].nativeElement.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected()).toEqual(['u1']);
    const trigger = fixture.debugElement.query(By.css('.gog-ms')).nativeElement as HTMLElement;
    expect(trigger.textContent).toContain('Ada Lovelace');
  });

  it('renders a projected gogDropdownOption row with the option, label and selected flag', async () => {
    const fixture = await render(OptionSlotHost);
    fixture.debugElement.query(By.css('.gog-select__control')).nativeElement.click();
    await fixture.whenStable();

    const rows = fixture.debugElement
      .queryAll(By.css('.custom-option'))
      .map((el) => el.nativeElement.textContent.trim());
    expect(rows).toEqual(['Ada Lovelace/u1', 'Alan Turing/u2']);
  });
});
