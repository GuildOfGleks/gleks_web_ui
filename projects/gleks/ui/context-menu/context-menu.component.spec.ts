import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogMenuItemDirective } from '@guildofgleks/ui/menu';
import {
  ContextMenuComponent,
  GogContextMenuContentDirective,
  GogContextMenuTriggerDirective,
} from './context-menu.component';

interface File {
  name: string;
}

@Component({
  imports: [
    ContextMenuComponent,
    GogContextMenuContentDirective,
    GogContextMenuTriggerDirective,
    GogMenuItemDirective,
  ],
  template: `
    <ul
      id="files"
      [gogContextMenu]="menu"
      [gogContextMenuResolve]="fileAt"
      [gogContextMenuDisabled]="disabled()"
    >
      @for (file of files; track file.name) {
        <li>
          <button type="button" [attr.data-name]="file.name">{{ file.name }}</button>
        </li>
      }
      <li id="gap">no file here</li>
    </ul>
    <div id="static" [gogContextMenu]="menu" [gogContextMenuData]="files[1]">Static</div>

    <gog-context-menu #menu ariaLabel="File actions">
      <ng-template gogContextMenuContent let-file [gogContextMenuContentTypeOf]="files">
        <button gogMenuItem type="button" (click)="renamed.push(file!.name)">
          Rename {{ file?.name }}
        </button>
        <button gogMenuItem type="button" disabled>Share</button>
        <button gogMenuItem type="button">Delete</button>
      </ng-template>
    </gog-context-menu>
  `,
})
class ContextHost {
  readonly files: File[] = [{ name: 'a.txt' }, { name: 'b.txt' }];
  readonly renamed: string[] = [];
  readonly disabled = signal(false);
  readonly fileAt = (target: HTMLElement): File | null => {
    const name = target.closest<HTMLElement>('[data-name]')?.dataset['name'];
    return this.files.find((file) => file.name === name) ?? null;
  };
}

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextHost>;

  const menu = () => document.querySelector<HTMLElement>('.gog-menu');
  const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.gog-menu__item'));
  const file = (name: string) =>
    document.querySelector<HTMLButtonElement>(`[data-name="${name}"]`)!;

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function rightClick(element: Element, x = 120, y = 80): MouseEvent {
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: x,
      clientY: y,
    });
    element.dispatchEvent(event);
    return event;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContextHost] }).compileComponents();
    fixture = TestBed.createComponent(ContextHost);
    document.body.appendChild(fixture.nativeElement);
    await settle();
  });

  afterEach(() => (fixture.nativeElement as HTMLElement).remove());

  it('opens at the pointer with the data resolved from what was clicked', async () => {
    const event = rightClick(file('b.txt'), 120, 80);
    await settle();
    expect(event.defaultPrevented).toBe(true);
    expect(menu()?.getAttribute('role')).toBe('menu');
    expect(menu()?.getAttribute('aria-label')).toBe('File actions');
    expect(menu()?.style.left).toBe('120px');
    expect(items()[0].textContent?.trim()).toBe('Rename b.txt');
    expect(document.activeElement).toBe(items()[0]);
  });

  it('leaves the browser menu alone where the resolver finds nothing', async () => {
    const event = rightClick(document.getElementById('gap')!);
    await settle();
    expect(event.defaultPrevented).toBe(false);
    expect(menu()).toBeNull();
  });

  it('runs the item with the data, closes, and gives focus back to what was clicked', async () => {
    rightClick(file('a.txt'));
    await settle();
    items()[0].click();
    await settle();
    expect(fixture.componentInstance.renamed).toEqual(['a.txt']);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(file('a.txt'));
  });

  it('arrows between the items stamped from the template, skipping disabled ones', async () => {
    rightClick(file('a.txt'));
    await settle();
    menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(items()[2]);
  });

  it('opens from the keyboard under the focused element on Shift+F10 or the ContextMenu key', async () => {
    file('a.txt').focus();
    file('a.txt').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true, cancelable: true }),
    );
    await settle();
    expect(items()[0].textContent?.trim()).toBe('Rename a.txt');
  });

  it('hands a static gogContextMenuData to the menu', async () => {
    rightClick(document.getElementById('static')!);
    await settle();
    expect(items()[0].textContent?.trim()).toBe('Rename b.txt');
  });

  it('does nothing while disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    await settle();
    expect(rightClick(file('a.txt')).defaultPrevented).toBe(false);
  });

  describe('long press', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    function pointer(
      type: string,
      element: Element,
      {
        x = 60,
        y = 40,
        pointerType = 'touch',
      }: { x?: number; y?: number; pointerType?: string } = {},
    ): void {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      Object.defineProperties(event, {
        pointerId: { value: 7 },
        pointerType: { value: pointerType },
        isPrimary: { value: true },
      });
      element.dispatchEvent(event);
    }

    /** Lets the timers run, then the menu render. */
    async function hold(ms: number): Promise<void> {
      await vi.advanceTimersByTimeAsync(ms);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    }

    it('opens at the finger after half a second held still, with the resolved data', async () => {
      pointer('pointerdown', file('b.txt'), { x: 60, y: 40 });
      await hold(400);
      expect(menu()).toBeNull();
      await hold(150);
      expect(menu()).not.toBeNull();
      expect(items()[0].textContent?.trim()).toBe('Rename b.txt');
    });

    it('is not a long press when it drifts, lifts early, or is a mouse', async () => {
      pointer('pointerdown', file('a.txt'), { x: 60, y: 40 });
      pointer('pointermove', file('a.txt'), { x: 60, y: 60 });
      await hold(600);
      expect(menu()).toBeNull();

      pointer('pointerdown', file('a.txt'));
      await hold(200);
      pointer('pointerup', file('a.txt'));
      await hold(600);
      expect(menu()).toBeNull();

      pointer('pointerdown', file('a.txt'), { pointerType: 'mouse' });
      await hold(600);
      expect(menu()).toBeNull();
    });

    it('opens once when the platform raises contextmenu for the same press, either way round', async () => {
      // Android after ours: the menu is already open, and the platform's event only stops its own.
      pointer('pointerdown', file('a.txt'));
      await hold(550);
      const late = rightClick(file('a.txt'));
      expect(late.defaultPrevented).toBe(true);
      expect(document.querySelectorAll('.gog-menu').length).toBe(1);
      pointer('pointerup', file('a.txt'));
      await hold(600);

      // Android before ours: the platform's event opens it, and the timer stands down.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await hold(0);
      pointer('pointerdown', file('b.txt'));
      rightClick(file('b.txt'));
      await hold(600);
      expect(document.querySelectorAll('.gog-menu').length).toBe(1);
    });

    it('swallows the click the release makes, and only that one', async () => {
      const clicks: string[] = [];
      file('a.txt').addEventListener('click', () => clicks.push('a'));
      pointer('pointerdown', file('a.txt'));
      await hold(550);
      pointer('pointerup', file('a.txt'));
      file('a.txt').click();
      expect(clicks).toEqual([]);
      await hold(600);
      file('a.txt').click();
      expect(clicks).toEqual(['a']);
    });

    it('keeps to the resolver and to disabled', async () => {
      pointer('pointerdown', document.getElementById('gap')!);
      await hold(600);
      expect(menu()).toBeNull();

      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      pointer('pointerdown', file('a.txt'));
      await hold(600);
      expect(menu()).toBeNull();
    });
  });

  it('closes when the page scrolls under it', async () => {
    rightClick(file('a.txt'));
    await settle();
    document.dispatchEvent(new Event('scroll'));
    await settle();
    expect(menu()).toBeNull();
  });
});
