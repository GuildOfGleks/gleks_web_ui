import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogBadgeDirective } from './badge.directive';

@Component({
  imports: [GogBadgeDirective],
  template: `
    <button
      [gogBadge]="value()"
      [badgePosition]="position()"
      [badgeVariant]="variant()"
      [badgeDot]="dot()"
      [badgeMax]="max()"
      [badgeHidden]="hidden()"
      [badgeAriaLabel]="ariaLabel()"
    >
      Inbox
    </button>
  `,
})
class BadgeHost {
  readonly value = signal<string | number | null>(12);
  readonly position = signal<'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'>('top-end');
  readonly variant = signal<'success' | 'danger' | 'warning' | 'info'>('danger');
  readonly dot = signal(false);
  readonly max = signal(99);
  readonly hidden = signal(false);
  readonly ariaLabel = signal('');
}

describe('GogBadgeDirective', () => {
  let fixture: ComponentFixture<BadgeHost>;
  let host: BadgeHost;

  function badge(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.gog-badge');
  }

  function button(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();
    fixture = TestBed.createComponent(BadgeHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render the badge into the host element', () => {
    expect(badge()).toBeTruthy();
    expect(badge()?.textContent).toBe('12');
    expect(badge()?.parentElement).toBe(button());
  });

  it('should make the host a containing block', () => {
    expect(button().classList.contains('gog-badge-host')).toBe(true);
  });

  it('should carry the position and variant classes', () => {
    expect(badge()?.classList.contains('gog-badge--top-end')).toBe(true);
    expect(badge()?.classList.contains('gog-badge--danger')).toBe(true);

    host.position.set('bottom-start');
    host.variant.set('info');
    fixture.detectChanges();

    expect(badge()?.classList.contains('gog-badge--bottom-start')).toBe(true);
    expect(badge()?.classList.contains('gog-badge--info')).toBe(true);
    expect(badge()?.classList.contains('gog-badge--top-end')).toBe(false);
  });

  it('should render nothing at all for 0', () => {
    host.value.set(0);
    fixture.detectChanges();
    expect(badge()).toBeNull();
  });

  it('should render nothing for null or an empty string', () => {
    host.value.set(null);
    fixture.detectChanges();
    expect(badge()).toBeNull();

    host.value.set('');
    fixture.detectChanges();
    expect(badge()).toBeNull();
  });

  it('should still render a dot when there is no value', () => {
    host.value.set(null);
    host.dot.set(true);
    fixture.detectChanges();

    expect(badge()).toBeTruthy();
    expect(badge()?.textContent).toBe('');
    expect(badge()?.classList.contains('gog-badge--dot')).toBe(true);
  });

  it('should cap the count at badgeMax', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(badge()?.textContent).toBe('99+');

    host.max.set(9);
    fixture.detectChanges();
    expect(badge()?.textContent).toBe('9+');
  });

  it('should leave non-numeric content uncapped', () => {
    host.value.set('NEW');
    fixture.detectChanges();
    expect(badge()?.textContent).toBe('NEW');
  });

  it('should remove the badge when badgeHidden flips on, and restore it', () => {
    host.hidden.set(true);
    fixture.detectChanges();
    expect(badge()).toBeNull();

    host.hidden.set(false);
    fixture.detectChanges();
    expect(badge()?.textContent).toBe('12');
  });

  it('should announce the number inline when no aria label is given', () => {
    expect(badge()?.getAttribute('aria-hidden')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-visually-hidden')).toBeNull();
  });

  it('should replace the number with the aria label when one is given', () => {
    host.ariaLabel.set('12 unread');
    fixture.detectChanges();

    expect(badge()?.getAttribute('aria-hidden')).toBe('true');
    const description = (fixture.nativeElement as HTMLElement).querySelector(
      '.gog-visually-hidden',
    );
    expect(description?.textContent).toBe('12 unread');
  });

  it('should drop the hidden description again when the aria label is cleared', () => {
    host.ariaLabel.set('12 unread');
    fixture.detectChanges();
    host.ariaLabel.set('');
    fixture.detectChanges();

    expect(badge()?.getAttribute('aria-hidden')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-visually-hidden')).toBeNull();
  });

  it('should keep the description in the name when the host is the focusable element', () => {
    host.ariaLabel.set('12 unread');
    fixture.detectChanges();

    // Inside the <button>, so it is part of its name — no aria-describedby needed.
    const description = button().querySelector('.gog-visually-hidden');
    expect(description?.textContent).toBe('12 unread');
    expect(description?.getAttribute('aria-hidden')).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBeNull();
  });

  it('should take the badge out of the DOM when the host is destroyed', () => {
    const buttonEl = button();
    expect(buttonEl.querySelector('.gog-badge')).toBeTruthy();

    fixture.destroy();
    expect(buttonEl.querySelector('.gog-badge')).toBeNull();
  });
});

/** The shape of `gog-button`: the directive sits on a wrapper, the focusable element is inside. */
@Component({
  imports: [GogBadgeDirective],
  template: `
    <span [gogBadge]="value()" [badgeAriaLabel]="ariaLabel()" [badgeHidden]="hidden()">
      <button type="button" aria-describedby="own-hint">Drafts</button>
    </span>
  `,
})
class WrappedBadgeHost {
  readonly value = signal<string | number | null>(3);
  readonly ariaLabel = signal('');
  readonly hidden = signal(false);
}

describe('GogBadgeDirective on a host whose focusable element is inside it', () => {
  let fixture: ComponentFixture<WrappedBadgeHost>;
  let host: WrappedBadgeHost;

  const root = () => fixture.nativeElement as HTMLElement;
  const button = () => root().querySelector('button')!;
  const description = () => root().querySelector<HTMLElement>('.gog-visually-hidden');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WrappedBadgeHost] }).compileComponents();
    fixture = TestBed.createComponent(WrappedBadgeHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('describes the inner element with the badge text, keeping its own description', () => {
    const ids = button().getAttribute('aria-describedby')!.split(' ');
    expect(ids[0]).toBe('own-hint');
    expect(ids).toContain(description()!.id);
    expect(description()!.textContent).toBe('3');
  });

  it('hides both copies beside the button from reading, so nothing is said twice', () => {
    expect(root().querySelector('.gog-badge')!.getAttribute('aria-hidden')).toBe('true');
    expect(description()!.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses badgeAriaLabel as the description when one is given', () => {
    host.ariaLabel.set('3 drafts');
    fixture.detectChanges();
    expect(description()!.textContent).toBe('3 drafts');
  });

  it('gives the inner element its own description back when the badge goes', () => {
    host.hidden.set(true);
    fixture.detectChanges();
    expect(description()).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBe('own-hint');
  });
});
