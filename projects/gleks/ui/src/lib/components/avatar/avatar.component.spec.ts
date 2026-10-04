import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AvatarComponent, gogAvatarInitials } from './avatar.component';

describe('gogAvatarInitials', () => {
  it('takes the first letter of the first and the last word', () => {
    expect(gogAvatarInitials('Ada King Lovelace')).toBe('AL');
    expect(gogAvatarInitials('grace hopper')).toBe('GH');
  });

  it('takes one letter from a single word, and nothing from blank text', () => {
    expect(gogAvatarInitials('Plato')).toBe('P');
    expect(gogAvatarInitials('   ')).toBe('');
  });

  it('keeps a grapheme whole rather than cutting a surrogate pair in half', () => {
    // An emoji is two UTF-16 units; `name[0]` would be half of one, which renders as garbage.
    expect(gogAvatarInitials('🦊 Fox')).toBe('🦊F');
  });
});

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let host: HTMLElement;

  const set = async (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const initials = () => host.querySelector('.gog-avatar__initials')?.textContent?.trim();
  const image = () => host.querySelector<HTMLImageElement>('.gog-avatar__image');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarComponent] }).compileComponents();
    fixture = TestBed.createComponent(AvatarComponent);
    host = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows the initials when there is no picture', async () => {
    await set({ name: 'Ada Lovelace' });
    expect(initials()).toBe('AL');
    expect(image()).toBeNull();
  });

  it('lets `initials` override the derived ones', async () => {
    await set({ name: 'Acme Incorporated', initials: 'AC' });
    expect(initials()).toBe('AC');
  });

  it('falls back to the icon when there is neither a picture nor a name', async () => {
    await set({ iconName: 'user' });
    expect(initials()).toBeUndefined();
    expect(host.querySelector('gog-icon.gog-avatar__icon')).not.toBeNull();
  });

  it('keeps the initials under the picture until it loads, then removes them', async () => {
    await set({ name: 'Ada Lovelace', src: '/ada.jpg' });
    expect(image()?.getAttribute('src')).toBe('/ada.jpg');
    expect(initials()).toBe('AL');

    image()!.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(initials()).toBeUndefined();
    expect(image()).not.toBeNull();
  });

  it('drops a picture that fails and shows the initials instead', async () => {
    await set({ name: 'Ada Lovelace', src: '/missing.jpg' });
    image()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(image()).toBeNull();
    expect(initials()).toBe('AL');
  });

  it('notices a picture that failed before it rendered, with no error event to hear', async () => {
    // The server-rendered case: the <img> loaded and failed before hydration attached a listener,
    // so it is `complete` with no natural width and no event is coming. jsdom loads nothing and
    // reports `complete: false`, so that state is stubbed.
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    const early = TestBed.createComponent(AvatarComponent);
    early.componentRef.setInput('name', 'Ada Lovelace');
    early.componentRef.setInput('src', '/missing.jpg');
    await early.whenStable();
    early.detectChanges();

    const el: HTMLElement = early.nativeElement;
    expect(el.querySelector('.gog-avatar__image')).toBeNull();
    expect(el.querySelector('.gog-avatar__initials')?.textContent?.trim()).toBe('AL');
    complete.mockRestore();
  });

  it('gives a new `src` its own chance after the last one failed', async () => {
    await set({ name: 'Ada Lovelace', src: '/missing.jpg' });
    image()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    await set({ src: '/ada.jpg' });
    expect(image()?.getAttribute('src')).toBe('/ada.jpg');
  });

  it('is an image named once by `name`, with both halves inside hidden', async () => {
    await set({ name: 'Ada Lovelace', src: '/ada.jpg' });
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(host.getAttribute('aria-hidden')).toBeNull();
    // The picture must not add a second name, and the letters must not be read as "A L".
    expect(image()?.getAttribute('alt')).toBe('');
    expect(host.querySelector('.gog-avatar__initials')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('is hidden when decorative, and when it has no name to announce', async () => {
    await set({ name: 'Ada Lovelace', decorative: true });
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.getAttribute('aria-label')).toBeNull();

    await set({ name: '', decorative: false });
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('carries its size and shape as classes', async () => {
    expect(host.classList).toContain('gog-avatar--md');
    expect(host.classList).toContain('gog-avatar--circle');
    await set({ size: 'xsm', shape: 'rounded' });
    expect(host.classList).toContain('gog-avatar--xsm');
    expect(host.classList).toContain('gog-avatar--rounded');
  });
});
