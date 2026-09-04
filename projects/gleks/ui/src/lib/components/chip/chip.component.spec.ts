import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ChipComponent } from './chip.component';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to rounded neutral styling', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-chip--md')).toBe(true);
    expect(host.classList.contains('gog-chip--rounded')).toBe(true);
  });

  it('should emit click events from the chip surface', () => {
    const emitSpy = vi.fn();
    component.gogClick.subscribe(emitSpy);
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    surface.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not expose click affordance when disabled from clicking', () => {
    fixture.componentRef.setInput('clickable', false);
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    expect(surface.getAttribute('role')).toBeNull();
    expect(surface.getAttribute('tabindex')).toBeNull();
    expect(surface.style.cursor).toBe('default');
  });

  it('should drop the hover affordance class when not clickable', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-chip--clickable')).toBe(true);

    fixture.componentRef.setInput('clickable', false);
    fixture.detectChanges();
    expect(host.classList.contains('gog-chip--clickable')).toBe(false);
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

  it('should render avatar and remove button when configured', () => {
    fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.gog-chip__avatar')).toBeTruthy();
    expect(host.querySelector('.gog-chip__remove')).toBeTruthy();
  });

  it('should keep remove button pointer cursor', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector(
      '.gog-chip__remove',
    ) as HTMLButtonElement;
    expect(getComputedStyle(removeButton).cursor).toBe('pointer');
  });

  it('should emit gogClick on Enter and Space, but not other keys', () => {
    const emitSpy = vi.fn();
    component.gogClick.subscribe(emitSpy);
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  it('should not emit gogClick when disabled, from click or keyboard', () => {
    const emitSpy = vi.fn();
    component.gogClick.subscribe(emitSpy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    surface.click();
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitSpy).not.toHaveBeenCalled();
    expect(surface.getAttribute('aria-disabled')).toBe('true');
  });

  it('should emit gogRemove without also emitting gogClick, and stop the click bubbling', () => {
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    component.gogClick.subscribe(clickSpy);
    component.gogRemove.subscribe(removeSpy);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector(
      '.gog-chip__remove',
    ) as HTMLButtonElement;
    removeButton.click();

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should not render remove button when disabled', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('.gog-chip__remove');
    expect(removeButton).toBeNull();
  });

  it('should support pill shape', () => {
    fixture.componentRef.setInput('shape', 'pill');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-chip--pill')).toBe(true);
  });

  // 11 inputs, 2 outputs and one aria assertion in the audit. What a keyboard or screen-reader
  // user meets is the interactive/disabled/removable triangle, so that is what these pin.
  describe('interactive, disabled and removable states', () => {
    function surface(): HTMLElement {
      return fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    }

    it('exposes a clickable chip as a focusable button to assistive tech', async () => {
      fixture.componentRef.setInput('clickable', true);
      await fixture.whenStable();

      expect(surface().getAttribute('role')).toBe('button');
      expect(surface().getAttribute('tabindex')).toBe('0');
      expect(surface().getAttribute('aria-disabled')).toBeNull();
    });

    it('is neither a button nor a tab stop when it is not clickable', async () => {
      fixture.componentRef.setInput('clickable', false);
      await fixture.whenStable();

      expect(surface().getAttribute('role')).toBeNull();
      expect(surface().getAttribute('tabindex')).toBeNull();
    });

    it('announces a disabled chip as disabled and takes it out of the tab order', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      expect(surface().getAttribute('aria-disabled')).toBe('true');
      expect(surface().getAttribute('tabindex')).toBeNull();
      expect(fixture.nativeElement.className).toContain('gog-chip--disabled');
    });

    it('emits gogClick from Enter and Space, the keys a role=button owes', async () => {
      const clicks: (MouseEvent | KeyboardEvent)[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));
      fixture.componentRef.setInput('clickable', true);
      await fixture.whenStable();

      surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      surface().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

      expect(clicks).toHaveLength(2);
    });

    it('stays silent on a key that is not an activation key', async () => {
      const clicks: unknown[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));
      fixture.componentRef.setInput('clickable', true);
      await fixture.whenStable();

      surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

      expect(clicks).toHaveLength(0);
    });

    it('emits nothing at all while disabled, by pointer or by key', async () => {
      const clicks: unknown[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      surface().click();
      surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(clicks).toHaveLength(0);
    });

    it('names the remove button, which is an icon with no text', async () => {
      fixture.componentRef.setInput('removable', true);
      fixture.componentRef.setInput('removeAriaLabel', 'Remove Angular');
      await fixture.whenStable();

      const remove = fixture.nativeElement.querySelector('.gog-chip__remove') as HTMLElement;
      expect(remove.getAttribute('aria-label')).toBe('Remove Angular');
    });

    it('hides the remove button on a disabled chip rather than offering a dead control', async () => {
      fixture.componentRef.setInput('removable', true);
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-chip__remove')).toBeNull();
    });

    it('removes without also firing the chip click underneath it', async () => {
      const removes: unknown[] = [];
      const clicks: unknown[] = [];
      component.gogRemove.subscribe(() => removes.push('removed'));
      component.gogClick.subscribe(() => clicks.push('clicked'));
      fixture.componentRef.setInput('removable', true);
      fixture.componentRef.setInput('clickable', true);
      await fixture.whenStable();

      (fixture.nativeElement.querySelector('.gog-chip__remove') as HTMLElement).click();

      expect(removes).toHaveLength(1);
      expect(clicks).toHaveLength(0);
    });
  });

  // `selected` is tri-state on purpose: `null` has to leave every chip that shipped before it
  // untouched, which is what the first two of these pin.
  describe('selected — the filter chip', () => {
    function surface(): HTMLElement {
      return fixture.nativeElement.querySelector('.gog-chip__surface') as HTMLElement;
    }

    it('is not a toggle at all by default — no aria-pressed, no ring', async () => {
      await fixture.whenStable();

      expect(surface().getAttribute('aria-pressed')).toBeNull();
      expect(fixture.nativeElement.className).not.toContain('gog-chip--selected');
    });

    it('leaves a plain chip alone on activation, rather than making it a toggle', async () => {
      await fixture.whenStable();

      surface().click();
      await fixture.whenStable();

      expect(component.selected()).toBeNull();
      expect(surface().getAttribute('aria-pressed')).toBeNull();
    });

    it('announces off as aria-pressed=false, not as an absent attribute', async () => {
      fixture.componentRef.setInput('selected', false);
      await fixture.whenStable();

      expect(surface().getAttribute('aria-pressed')).toBe('false');
      expect(fixture.nativeElement.className).not.toContain('gog-chip--selected');
    });

    it('shows on both ways round — the attribute and the ring', async () => {
      fixture.componentRef.setInput('selected', true);
      await fixture.whenStable();

      expect(surface().getAttribute('aria-pressed')).toBe('true');
      expect(fixture.nativeElement.className).toContain('gog-chip--selected');
    });

    it('flips itself on click and on the two activation keys', async () => {
      fixture.componentRef.setInput('selected', false);
      await fixture.whenStable();

      surface().click();
      await fixture.whenStable();
      expect(component.selected()).toBe(true);

      surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();
      expect(component.selected()).toBe(false);

      surface().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await fixture.whenStable();
      expect(component.selected()).toBe(true);
    });

    it('emits gogClick after the flip, so a handler reads the new value', async () => {
      const seen: (boolean | null)[] = [];
      component.gogClick.subscribe(() => seen.push(component.selected()));
      fixture.componentRef.setInput('selected', false);
      await fixture.whenStable();

      surface().click();
      await fixture.whenStable();

      expect(seen).toEqual([true]);
    });

    it('does not flip while disabled, and emits nothing', async () => {
      const clicks: unknown[] = [];
      component.gogClick.subscribe(() => clicks.push('clicked'));
      fixture.componentRef.setInput('selected', true);
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      surface().click();
      surface().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();

      expect(component.selected()).toBe(true);
      expect(clicks).toHaveLength(0);
    });

    it('keeps the ring on a disabled chip but drops the attribute with the role', async () => {
      fixture.componentRef.setInput('selected', true);
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      expect(surface().getAttribute('role')).toBeNull();
      expect(surface().getAttribute('aria-pressed')).toBeNull();
      expect(fixture.nativeElement.className).toContain('gog-chip--selected');
    });

    it('writes no aria-pressed on a chip that is not clickable', async () => {
      fixture.componentRef.setInput('selected', true);
      fixture.componentRef.setInput('clickable', false);
      await fixture.whenStable();

      expect(surface().getAttribute('aria-pressed')).toBeNull();
    });
  });
});
