import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { GogMenuItemDirective, GogMenuTriggerDirective, MenuComponent } from './menu.component';

@Component({
  standalone: true,
  imports: [MenuComponent, GogMenuItemDirective, GogMenuTriggerDirective],
  template: `
    <button class="trigger" [gogMenuTrigger]="rowMenu" aria-label="Row actions">Actions</button>

    <gog-menu #rowMenu ariaLabel="Row actions">
      <button gogMenuItem class="item-edit" (click)="ran.push('edit')">Edit</button>
      <button gogMenuItem class="item-archive" disabled (click)="ran.push('archive')">
        Archive
      </button>
      <button gogMenuItem class="item-delete" (click)="ran.push('delete')">Delete</button>
    </gog-menu>

    <button class="outside">Elsewhere</button>
  `,
})
class MenuHostComponent {
  readonly ran: string[] = [];
}

describe('MenuComponent', () => {
  let fixture: ComponentFixture<MenuHostComponent>;
  let host: MenuHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(MenuHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.trigger') as HTMLButtonElement;
  }

  function panel(): HTMLElement | null {
    return document.querySelector('[role="menu"]');
  }

  function items(): HTMLElement[] {
    return [...(panel()?.querySelectorAll('[role="menuitem"]') ?? [])] as HTMLElement[];
  }

  async function openByClick(): Promise<void> {
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function key(target: HTMLElement, name: string): Promise<void> {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders nothing until it is opened', () => {
    expect(panel()).toBeNull();
    // A closed menu must not leave its commands in the accessibility tree.
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(0);
  });

  describe('the trigger', () => {
    it('advertises the menu it controls', async () => {
      expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().getAttribute('aria-controls')).toBeNull();

      await openByClick();

      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-controls')).toBe(panel()?.id);
    });

    it('toggles: a second click closes what the first opened', async () => {
      await openByClick();
      expect(panel()).toBeTruthy();

      await openByClick();
      expect(panel()).toBeNull();
    });

    it('opens on ArrowDown with the first enabled item focused', async () => {
      await key(trigger(), 'ArrowDown');

      expect(panel()).toBeTruthy();
      expect(document.activeElement).toBe(items()[0]);
    });

    it('opens on ArrowUp with the last item focused', async () => {
      await key(trigger(), 'ArrowUp');

      expect(document.activeElement).toBe(items()[2]);
    });
  });

  describe('the panel', () => {
    it('is a menu with the name it was given', async () => {
      await openByClick();

      expect(panel()?.getAttribute('role')).toBe('menu');
      expect(panel()?.getAttribute('aria-label')).toBe('Row actions');
    });

    it('marks every projected button as a menu item outside the tab order', async () => {
      await openByClick();

      expect(items()).toHaveLength(3);
      for (const item of items()) {
        expect(item.getAttribute('role')).toBe('menuitem');
        expect(item.getAttribute('tabindex')).toBe('-1');
      }
    });

    it('focuses the first item on open, skipping a disabled one when it comes first', async () => {
      await openByClick();

      expect(document.activeElement).toBe(items()[0]);
    });
  });

  describe('keyboard navigation', () => {
    it('moves down the list with ArrowDown, stepping over disabled items', async () => {
      await openByClick();

      await key(items()[0], 'ArrowDown');

      // 'Archive' is disabled, so ArrowDown from 'Edit' lands on 'Delete'.
      expect(document.activeElement).toBe(items()[2]);
    });

    it('wraps from the last item back to the first', async () => {
      await openByClick();
      items()[2].focus();

      await key(items()[2], 'ArrowDown');

      expect(document.activeElement).toBe(items()[0]);
    });

    it('jumps to the ends with Home and End', async () => {
      await openByClick();

      await key(items()[0], 'End');
      expect(document.activeElement).toBe(items()[2]);

      await key(items()[2], 'Home');
      expect(document.activeElement).toBe(items()[0]);
    });
  });

  describe('closing', () => {
    it('closes on Escape and puts focus back on the trigger', async () => {
      await openByClick();
      expect(document.activeElement).not.toBe(trigger());

      await key(items()[0], 'Escape');

      expect(panel()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('closes when an item runs, so focus returns to the trigger it came from', async () => {
      await openByClick();

      items()[0].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(host.ran).toEqual(['edit']);
      expect(panel()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('closes on Tab and lets focus continue past it', async () => {
      await openByClick();

      await key(items()[0], 'Tab');

      expect(panel()).toBeNull();
      // Tab is the user leaving: focus must not be yanked back to the trigger.
      expect(document.activeElement).not.toBe(trigger());
    });

    it('closes on a pointer press outside, without stealing focus back', async () => {
      await openByClick();

      const outside = fixture.nativeElement.querySelector('.outside') as HTMLElement;
      outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(panel()).toBeNull();
      expect(document.activeElement).not.toBe(trigger());
    });

    it('emits gogClosed once per close', async () => {
      const closed = vi.fn();
      const menu = fixture.debugElement.query(
        (node) => node.componentInstance instanceof MenuComponent,
      ).componentInstance as MenuComponent;
      menu.gogClosed.subscribe(closed);

      await openByClick();
      await key(items()[0], 'Escape');

      expect(closed).toHaveBeenCalledTimes(1);
    });
  });

  describe('where the panel renders', () => {
    // Always `<body>`, never in place: the host is `display: contents`, so an in-place panel has
    // nothing to position against, and `position: fixed` inside a `contain`/`transform` ancestor
    // — which `gog-scroll` is — resolves against that ancestor rather than the viewport. A menu
    // inside a scroller landed nowhere at all, which is what removed the mode.
    it('renders into the overlay host, outside the component that declared it', async () => {
      await openByClick();

      const rendered = panel();
      expect(rendered).toBeTruthy();
      expect(rendered?.closest('.gog-overlay-host')).toBeTruthy();
      expect(fixture.nativeElement.contains(rendered)).toBe(false);
    });

    it('scrolls its items with gog-scroll rather than the browser default', async () => {
      await openByClick();

      const scroller = panel()?.querySelector('gog-scroll');
      expect(scroller).toBeTruthy();
      // Every item lives inside it, so a long menu scrolls the panel and not the page.
      for (const item of items()) {
        expect(scroller?.contains(item)).toBe(true);
      }
    });

    it('takes the stacking order the trigger inherits, so a menu in a dialog stays on top', async () => {
      trigger().style.setProperty('--gog-dropdown-z', '1310');

      await openByClick();

      expect(panel()?.style.zIndex).toBe('1310');
    });

    it('leaves the z-index to CSS when nothing above it sets one', async () => {
      await openByClick();

      expect(panel()?.style.zIndex).toBe('');
    });
  });
});
