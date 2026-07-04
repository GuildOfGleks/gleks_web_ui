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

    const removeButton = fixture.nativeElement.querySelector('.gog-chip__remove') as HTMLButtonElement;
    expect(getComputedStyle(removeButton).cursor).toBe('pointer');
  });

  it('should support pill shape', () => {
    fixture.componentRef.setInput('shape', 'pill');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-chip--pill')).toBe(true);
  });
});
