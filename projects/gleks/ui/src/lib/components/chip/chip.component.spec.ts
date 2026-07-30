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
});
