import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '../../shared/config';
import { ButtonComponent } from '../button/button.component';
import { GogButtonDirective } from '../button/button.directive';
import { ChipComponent } from '../chip/chip.component';

/**
 * The `ripple` input's precedence, which is the same three-step chain every configurable input in
 * this library uses — instance, then `GOG_CONFIG`, then the component's own default — and is
 * tested once here rather than nine times, because nine copies of a `??` chain are exactly what
 * `resolveRipple` exists to prevent drifting.
 *
 * A ripple is "wired" when its host carries `.gog-ripple-host`: the controller adds that class
 * only while it is actually listening, so the class is the honest signal that the effect is on
 * and paying for itself. Whether a wave then appears is `ripple.directive.spec.ts`'s business.
 */
@Component({
  imports: [ButtonComponent, ChipComponent, GogButtonDirective],
  template: `
    <gog-button [ripple]="buttonRipple()">Save</gog-button>
    <a gogButton href="#" [ripple]="linkRipple()">Docs</a>
    <gog-chip [ripple]="chipRipple()" [clickable]="chipClickable()">Beta</gog-chip>
  `,
})
class RippleConfigHost {
  readonly buttonRipple = signal<boolean | undefined>(undefined);
  readonly linkRipple = signal<boolean | undefined>(undefined);
  readonly chipRipple = signal<boolean | undefined>(undefined);
  readonly chipClickable = signal(true);
}

describe('ripple — GOG_CONFIG.ripple.enabled', () => {
  let fixture: ComponentFixture<RippleConfigHost>;
  let host: RippleConfigHost;

  async function setUp(config: unknown = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [RippleConfigHost],
      providers: [{ provide: GOG_CONFIG, useValue: config }],
    }).compileComponents();

    fixture = TestBed.createComponent(RippleConfigHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  function rippling(selector: string): boolean {
    const element = (fixture.nativeElement as HTMLElement).querySelector(selector);
    return element?.classList.contains('gog-ripple-host') ?? false;
  }

  it('is off everywhere when nothing sets it — the effect is purely additive', async () => {
    await setUp();

    expect(rippling('.gog-btn')).toBe(false);
    expect(rippling('a[gogButton]')).toBe(false);
    expect(rippling('.gog-chip__surface')).toBe(false);
  });

  it('turns on every surface at once when the app asks for it', async () => {
    await setUp({ ripple: { enabled: true } });

    expect(rippling('.gog-btn')).toBe(true);
    expect(rippling('a[gogButton]')).toBe(true);
    expect(rippling('.gog-chip__surface')).toBe(true);
  });

  it('lets one instance opt out of an app-wide on', async () => {
    await setUp({ ripple: { enabled: true } });

    host.buttonRipple.set(false);
    await fixture.whenStable();

    expect(rippling('.gog-btn')).toBe(false);
    // The others are untouched: this is per instance, not a second global switch.
    expect(rippling('a[gogButton]')).toBe(true);
  });

  it('lets one instance opt in without the app switching over', async () => {
    await setUp();

    host.chipRipple.set(true);
    await fixture.whenStable();

    expect(rippling('.gog-chip__surface')).toBe(true);
    expect(rippling('.gog-btn')).toBe(false);
  });

  it('does not ripple a chip that is not interactive, whatever the config says', async () => {
    await setUp({ ripple: { enabled: true } });

    host.chipClickable.set(false);
    await fixture.whenStable();

    // A chip that cannot be pressed is a label, and a label answering a press with a wave is a
    // promise it cannot keep.
    expect(rippling('.gog-chip__surface')).toBe(false);
  });
});
