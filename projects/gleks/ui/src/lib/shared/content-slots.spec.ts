import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  CheckboxComponent,
  GogCheckboxIconDirective,
} from '../components/checkbox/checkbox.component';
import { GogTagIconDirective, TagComponent } from '../components/tag/tag.component';
import {
  GogMultiselectClearIconDirective,
  MultiselectComponent,
} from '../components/multiselect/multiselect.component';
import { SelectComponent } from '../components/select/select.component';
import {
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  InputfieldComponent,
} from '../components/inputfield/inputfield.component';
import { GogDropdownChevronDirective } from './dropdown-base';

/**
 * The projected-template slots introduced in 21.3.0. They replaced the per-slot
 * `input<TemplateRef>` pairs deprecated at the same time, which were removed in 21.5.0 — so
 * these are now the only way to substitute a component's built-in glyph, and each case asserts
 * the projected template actually reaches the slot it names.
 */

const MARKER = '.slot-marker';

@Component({
  standalone: true,
  imports: [CheckboxComponent, GogCheckboxIconDirective],
  template: `
    <gog-checkbox [checked]="true">
      <ng-template gogCheckboxIcon><i class="slot-marker">projected</i></ng-template>
    </gog-checkbox>
  `,
})
class CheckboxSlotHost {}

@Component({
  standalone: true,
  imports: [TagComponent, GogTagIconDirective],
  template: `
    <gog-tag>
      <ng-template gogTagIcon><i class="slot-marker">projected</i></ng-template>
      Featured
    </gog-tag>
  `,
})
class TagSlotHost {}

@Component({
  standalone: true,
  imports: [SelectComponent, GogDropdownChevronDirective],
  template: `
    <gog-select [options]="[]">
      <ng-template gogDropdownChevron><i class="slot-marker">projected</i></ng-template>
    </gog-select>
  `,
})
class SelectChevronHost {}

@Component({
  standalone: true,
  imports: [MultiselectComponent, GogMultiselectClearIconDirective],
  template: `
    <gog-multiselect [options]="options" [value]="['a']">
      <ng-template gogMultiselectClearIcon><i class="slot-marker">projected</i></ng-template>
    </gog-multiselect>
  `,
})
class MultiselectClearHost {
  readonly options = [{ id: 'a', name: 'Alpha' }];
}

@Component({
  standalone: true,
  imports: [InputfieldComponent, GogInputAddonStartDirective, GogInputAddonEndDirective],
  template: `
    <gog-inputfield label="Amount" [type]="type()">
      <span gogInputAddonStart class="slot-marker">€</span>
      <button gogInputAddonEnd type="button" class="end-marker" aria-label="Clear">x</button>
    </gog-inputfield>
  `,
})
class InputAddonHost {
  readonly type = signal<'text' | 'password'>('text');
}

async function render<T>(host: new () => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  return fixture;
}

describe('projected content slots', () => {
  it('gogCheckboxIcon renders in place of the built-in tick', async () => {
    const fixture = await render(CheckboxSlotHost);
    expect(fixture.debugElement.query(By.css(MARKER))).toBeTruthy();
  });

  it('gogTagIcon renders — and opens the icon slot, which is gated on hasIcon()', async () => {
    // Regression guard: `hasIcon` originally only counted `iconName`, so a tag with nothing
    // but a projected template rendered no icon at all.
    const fixture = await render(TagSlotHost);
    expect(fixture.debugElement.query(By.css(MARKER))).toBeTruthy();
  });

  it('gogDropdownChevron renders on gog-select in place of the built-in chevron', async () => {
    const fixture = await render(SelectChevronHost);
    expect(fixture.debugElement.query(By.css(MARKER))).toBeTruthy();
  });

  it('gogMultiselectClearIcon renders inside the clear button', async () => {
    const fixture = await render(MultiselectClearHost);
    const clear = fixture.debugElement.query(By.css('.gog-ms__clear'));
    expect(clear).toBeTruthy();
    expect(clear.query(By.css(MARKER))).toBeTruthy();
  });

  describe('gog-inputfield addons', () => {
    it('projects both addons into their slots', async () => {
      const fixture = await render(InputAddonHost);
      const start = fixture.debugElement.query(By.css('.gog-input__icon--start ' + MARKER));
      const end = fixture.debugElement.query(By.css('.gog-input__icon--end .end-marker'));
      expect(start).toBeTruthy();
      expect(end).toBeTruthy();
    });

    it('widens the field gutters so an addon cannot overlap the text', async () => {
      const fixture = await render(InputAddonHost);
      const wrapper = fixture.debugElement.query(By.css('.gog-input-wrapper'));
      expect(wrapper.nativeElement.classList).toContain('gog-input-wrapper--icon-start');
      expect(wrapper.nativeElement.classList).toContain('gog-input-wrapper--icon-end');
    });

    it("lets a password field's built-in reveal toggle keep the end slot", async () => {
      const fixture = await render(InputAddonHost);
      fixture.componentInstance.type.set('password');
      await fixture.whenStable();

      // the projected end addon is ignored, the toggle button stays
      expect(fixture.debugElement.query(By.css('.end-marker'))).toBeNull();
      const toggle = fixture.debugElement.query(
        By.css('.gog-input__icon--end.gog-input__icon--action'),
      );
      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.getAttribute('aria-label')).toBe('Show password');
      // the leading addon is unaffected
      expect(fixture.debugElement.query(By.css(MARKER))).toBeTruthy();
    });
  });
});
