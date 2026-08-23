import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AutocompleteComponent } from './autocomplete.component';
import { GOG_CONFIG } from '../../shared/config';
import type { GogDropdownOption } from '../../shared/dropdown-base';

const OPTIONS: GogDropdownOption[] = [
  { id: 1, name: 'Ангуляр' },
  { id: 2, name: 'Анимация' },
  { id: 3, name: 'Бета', disabled: true },
  { id: 4, name: 'Гамма' },
];

type DefaultAutocomplete = AutocompleteComponent<GogDropdownOption, string | number | null>;

describe('AutocompleteComponent', () => {
  let fixture: ComponentFixture<DefaultAutocomplete>;
  let component: DefaultAutocomplete;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function field(): HTMLInputElement {
    return host().querySelector('input')!;
  }

  function options(): HTMLElement[] {
    return Array.from(host().querySelectorAll('[role="option"]'));
  }

  function type(text: string): void {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function keydown(key: string): void {
    field().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent<DefaultAutocomplete>(AutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render a combobox input, not a button trigger', () => {
    // The whole reason this is a separate control from gog-select.
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().getAttribute('aria-autocomplete')).toBe('list');
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('should stay closed until minLength characters are typed', () => {
    expect(options().length).toBe(0);

    type('');
    expect(component.isOpen()).toBe(false);

    type('а');
    expect(component.isOpen()).toBe(true);
  });

  it('should honour a larger minLength', () => {
    fixture.componentRef.setInput('minLength', 3);
    fixture.detectChanges();

    type('ан');
    expect(component.isOpen()).toBe(false);

    type('анг');
    expect(component.isOpen()).toBe(true);
  });

  describe('openOnFocus', () => {
    it('should open with the full list on focus by default, ignoring minLength', () => {
      fixture.componentRef.setInput('minLength', 3);
      fixture.detectChanges();

      field().dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
      expect(options().length).toBe(OPTIONS.length);
    });

    it('should do nothing on focus when switched off', () => {
      fixture.componentRef.setInput('openOnFocus', false);
      fixture.detectChanges();

      field().dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
    });

    it('should show every option on focus even when the field already displays a selection', () => {
      type('а');
      keydown('ArrowDown');
      keydown('Enter');
      expect(field().value).toBe('Ангуляр');

      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      field().dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      // Without the browsingAll bypass this would filter down to just the one option whose
      // label matches the text already sitting in the field.
      expect(options().length).toBe(OPTIONS.length);
    });

    it('should resume normal filtering as soon as the user types', () => {
      field().dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(options().length).toBe(OPTIONS.length);

      type('ан');
      expect(options().map((option) => option.textContent?.trim())).toEqual([
        'Ангуляр',
        'Анимация',
      ]);
    });
  });

  it('should filter locally, case-insensitively', () => {
    type('ан');
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Ангуляр', 'Анимация']);
  });

  it('should not filter locally when filterLocal is off', () => {
    // A server-backed source already returns a filtered list; filtering it again here is the
    // classic double-filtering bug.
    fixture.componentRef.setInput('filterLocal', false);
    fixture.detectChanges();

    type('ничего такого');
    expect(options().length).toBe(OPTIONS.length);
  });

  it('should show the empty message when nothing matches', () => {
    fixture.componentRef.setInput('emptyMessage', 'Пусто');
    fixture.detectChanges();

    type('щщщ');
    expect(options().length).toBe(0);
    expect(host().querySelector('.gog-autocomplete__empty')?.textContent?.trim()).toBe('Пусто');
  });

  describe('keyboard', () => {
    it('should open on ArrowDown without highlighting anything yet', () => {
      keydown('ArrowDown');

      expect(component.isOpen()).toBe(true);
      expect(field().getAttribute('aria-activedescendant')).toBeNull();
    });

    it('should highlight with the arrows and point aria-activedescendant at it', () => {
      type('а');
      keydown('ArrowDown');

      const active = host().querySelector('.gog-autocomplete__option--active');
      expect(active).toBeTruthy();
      expect(field().getAttribute('aria-activedescendant')).toBe(active?.id);
    });

    it('should keep DOM focus in the input while navigating', () => {
      field().focus();
      type('а');
      keydown('ArrowDown');

      // A combobox must not move focus onto the option — that is what separates it from the
      // listbox pattern gog-select uses.
      expect(document.activeElement).toBe(field());
    });

    it('should wrap around the highlight', () => {
      // 'ан' rather than 'а': the match is a substring, and every option here happens to
      // contain an 'а' somewhere.
      type('ан');
      keydown('ArrowUp');

      const active = host().querySelector('.gog-autocomplete__option--active');
      expect(active?.textContent?.trim()).toBe('Анимация');
    });

    it('should do nothing on Enter when nothing is highlighted', () => {
      type('а');
      keydown('Enter');

      expect(component.value()).toBeNull();
      expect(component.isOpen()).toBe(true);
    });

    it('should commit the highlighted option on Enter', () => {
      type('а');
      keydown('ArrowDown');
      keydown('Enter');

      expect(component.value()).toBe(1);
      expect(field().value).toBe('Ангуляр');
      expect(component.isOpen()).toBe(false);
    });

    it('should close and restore the selected text on Escape', () => {
      type('а');
      keydown('ArrowDown');
      keydown('Enter');

      type('переписал');
      keydown('Escape');

      expect(component.isOpen()).toBe(false);
      expect(field().value).toBe('Ангуляр');
    });

    it('should leave Home/End to the caret while closed', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true });
      field().dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
    });
  });

  it('should commit on click', () => {
    type('а');
    options()[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe(2);
    expect(field().value).toBe('Анимация');
  });

  it('should prevent mousedown on an option so the input keeps focus', () => {
    type('а');
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    options()[0].dispatchEvent(event);

    // Without this the input blurs first, forceSelection wipes the text, and the click lands
    // on a list that has already closed.
    expect(event.defaultPrevented).toBe(true);
  });

  it('should ignore a disabled option', () => {
    type('б');
    options()[0].click();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
  });

  it('should keep the selection while it is being edited, so Escape can undo the edit', () => {
    type('ан');
    keydown('ArrowDown');
    keydown('Enter');
    expect(component.value()).toBe(1);

    type('Ангуля');
    // Dropping it per keystroke would mean someone who types one character to refine their
    // search and then changes their mind has silently lost what they had picked.
    expect(component.value()).toBe(1);
  });

  it('should drop the value as soon as the text diverges when forceSelection is off', () => {
    fixture.componentRef.setInput('forceSelection', false);
    fixture.detectChanges();

    type('ан');
    keydown('ArrowDown');
    keydown('Enter');
    expect(component.value()).toBe(1);

    type('Ангуля');
    // Here the text is the answer, so leaving the id behind would let a form submit a
    // selection the field no longer shows.
    expect(component.value()).toBeNull();
  });

  describe('forceSelection', () => {
    it('should discard unmatched free text on blur by default', () => {
      type('несуществующее');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('');
      expect(component.value()).toBeNull();
    });

    it('should restore the selected label on blur', () => {
      type('а');
      keydown('ArrowDown');
      keydown('Enter');

      type('мусор');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('Ангуляр');
    });

    it('should keep free text when switched off', () => {
      fixture.componentRef.setInput('forceSelection', false);
      fixture.detectChanges();

      type('своё значение');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('своё значение');
    });
  });

  describe('erasing the field', () => {
    /*
     * The field could not be cleared at all while it held a selection: nine backspaces on
     * "Amsterdam" left "Amsterdam". Deleting the last character takes the text under `minLength`,
     * which closes the panel — and the effect that keeps the field showing the selection used
     * `!isOpen()` to mean "the user is not mid-edit", so it fired and wrote the label straight
     * back. Reproduced in the showcase with real keystrokes before this was changed.
     */
    it('should let the text be erased while a selection is held', () => {
      type('а');
      keydown('ArrowDown');
      keydown('Enter');
      expect(field().value).toBe('Ангуляр');

      type('Ангуля');
      type('');

      expect(field().value).toBe('');
      // The value survives the edit — that is what `forceSelection` means, and blur restores it.
      expect(component.value()).not.toBeNull();
    });

    /*
     * The other half: the effect still exists to sync a value the *component* did not set —
     * a form writing one in, or the options arriving after the value did. Its trigger is
     * `selectedLabel()` changing, which is what this asserts; if it had been made to depend on
     * the edit flag instead, this would keep passing while the erase test above broke again.
     */
    it('should still show a value written from outside', async () => {
      fixture.componentRef.setInput('value', 2);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(field().value).toBe('Анимация');
    });
  });

  /*
   * The spinner in the actions slot is `aria-hidden`, so a field fetching its suggestions looked
   * idle — and unlike a button the user pressed, this wait is not something they started, so
   * there is nothing else to infer it from. The rule is in `api-design.instructions.md`;
   * `gog-autocomplete` was one of its two known violations until 21.6.0.
   */
  it('should mark itself busy while loading', async () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.hasAttribute('aria-busy')).toBe(false);

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(element.getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(element.hasAttribute('aria-busy')).toBe(false);
  });

  describe('gogSearch', () => {
    // Only `setTimeout`/`clearTimeout` are faked, and only here. Faking the whole clock breaks
    // Angular's own scheduler — the fixture's `ApplicationRef` is then torn down before the
    // next spec runs, which surfaces as NG0406 on every test in the file rather than here.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce and emit the query once', () => {
      const seen: string[] = [];
      component.gogSearch.subscribe((query) => seen.push(query));

      type('а');
      type('ан');
      type('анг');
      expect(seen).toEqual([]);

      vi.advanceTimersByTime(300);
      expect(seen).toEqual(['анг']);
    });

    it('should emit on every keystroke when the debounce is 0', () => {
      fixture.componentRef.setInput('searchDebounce', 0);
      fixture.detectChanges();

      const seen: string[] = [];
      component.gogSearch.subscribe((query) => seen.push(query));

      type('а');
      type('ан');
      expect(seen).toEqual(['а', 'ан']);
    });

    it('should not fire a pending search after a selection', () => {
      const seen: string[] = [];
      component.gogSearch.subscribe((query) => seen.push(query));

      type('а');
      keydown('ArrowDown');
      keydown('Enter');
      vi.advanceTimersByTime(1000);

      expect(seen).toEqual([]);
    });
  });

  describe('gogLoadMore', () => {
    /** jsdom never lays elements out, so scroll/client metrics are stubbed as needed. */
    function mockMetrics(
      el: HTMLElement,
      metrics: Partial<{ scrollHeight: number; clientHeight: number }>,
    ): void {
      for (const [key, value] of Object.entries(metrics)) {
        Object.defineProperty(el, key, { value, configurable: true });
      }
    }

    async function settleMeasure(): Promise<void> {
      await fixture.whenStable();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    it('should fire once the panel is scrolled to the end of the option list', async () => {
      type('а');
      const viewport = host().querySelector('.gog-autocomplete__scroll .gog-scroll__viewport')!;
      mockMetrics(viewport as HTMLElement, { scrollHeight: 400, clientHeight: 100 });
      Object.defineProperty(viewport, 'scrollTop', { value: 300, configurable: true });

      const seen: void[] = [];
      component.gogLoadMore.subscribe(() => seen.push(undefined));

      viewport.dispatchEvent(new Event('scroll'));
      await settleMeasure();

      expect(seen.length).toBe(1);
    });
  });

  it('should show a spinner while loading', () => {
    expect(host().querySelector('gog-spinner')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(host().querySelector('gog-spinner')).toBeTruthy();
  });

  it('should emit the option object itself when optionValue is null', () => {
    fixture.componentRef.setInput('optionValue', null);
    fixture.detectChanges();

    type('а');
    options()[0].click();
    fixture.detectChanges();

    expect(component.value()).toBe(OPTIONS[0]);
  });

  it('should clear the text as well as the value', () => {
    fixture.componentRef.setInput('clearable', true);
    type('а');
    options()[0].click();
    fixture.detectChanges();

    host().querySelector<HTMLButtonElement>('.gog-autocomplete__clear')!.click();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(field().value).toBe('');
  });
});

describe('AutocompleteComponent — GOG_CONFIG', () => {
  it('should take the debounce and minLength from the global config', async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
      providers: [
        { provide: GOG_CONFIG, useValue: { autocomplete: { searchDebounce: 50, minLength: 2 } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent<DefaultAutocomplete>(AutocompleteComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    await fixture.whenStable();
    fixture.detectChanges();

    const seen: string[] = [];
    fixture.componentInstance.gogSearch.subscribe((query) => seen.push(query));

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
      input.value = 'а';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // minLength 2 from the config, so one character is not enough to open the panel.
      expect(fixture.componentInstance.isOpen()).toBe(false);

      vi.advanceTimersByTime(50);
      expect(seen).toEqual(['а']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should take openOnFocus from the global config', async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
      providers: [{ provide: GOG_CONFIG, useValue: { autocomplete: { openOnFocus: false } } }],
    }).compileComponents();

    const fixture = TestBed.createComponent<DefaultAutocomplete>(AutocompleteComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    await fixture.whenStable();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isOpen()).toBe(false);
  });
});

@Component({
  imports: [AutocompleteComponent, ReactiveFormsModule],
  template: `<gog-autocomplete [formControl]="control" [options]="options()" label="Тег" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string | number | null>(2);
  readonly options = signal(OPTIONS);
}

describe('AutocompleteComponent — Reactive Forms', () => {
  let fixture: ComponentFixture<ReactiveHost>;
  let hostComponent: ReactiveHost;

  function field(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
    fixture = TestBed.createComponent(ReactiveHost);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show the label of the value the form wrote', () => {
    expect(field().value).toBe('Анимация');
  });

  it('should follow a later control update', async () => {
    hostComponent.control.setValue(4);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field().value).toBe('Гамма');
  });

  it('should honour the control being disabled', async () => {
    hostComponent.control.disable();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field().disabled).toBe(true);
  });
});
