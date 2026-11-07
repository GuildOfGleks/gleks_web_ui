import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import { RatingComponent } from './rating.component';

@Component({
  imports: [RatingComponent, ReactiveFormsModule],
  template: `
    <gog-rating
      label="Your rating"
      [max]="max()"
      [readonly]="readonly()"
      [clearable]="clearable()"
      [formControl]="control"
    />
  `,
})
class Host {
  readonly max = signal(5);
  readonly readonly = signal(false);
  readonly clearable = signal(false);
  readonly control = new FormControl<number | null>(null);
}

async function render(providers: unknown[] = []) {
  await TestBed.configureTestingModule({
    imports: [Host],
    providers: providers as never[],
  }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const radios = () => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  const stars = () => Array.from(root.querySelectorAll<HTMLElement>('.gog-rating__star'));
  const fills = () =>
    Array.from(root.querySelectorAll<HTMLElement>('.gog-rating__glyph')).map((el) =>
      Number(el.style.getPropertyValue('--gog-rating-fill')),
    );
  const settle = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, root, radios, stars, fills, settle };
}

describe('RatingComponent', () => {
  it('is a radio group named by its label, one radio per star, each named in words', async () => {
    const { root, radios } = await render();
    const group = root.querySelector('[role="radiogroup"]')!;
    const label = root.querySelector('.gog-rating__label')!;
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    expect(radios().map((r) => r.getAttribute('aria-label'))).toEqual([
      '1 star',
      '2 stars',
      '3 stars',
      '4 stars',
      '5 stars',
    ]);
    // One group: every radio shares a name, so the platform gives it one tab stop and arrow keys.
    expect(new Set(radios().map((r) => r.name)).size).toBe(1);
  });

  it('draws as many stars as max', async () => {
    const { fixture, radios, settle } = await render();
    fixture.componentInstance.max.set(10);
    await settle();
    expect(radios().length).toBe(10);
  });

  it('sets the value and the form control on a press, and fills up to it', async () => {
    const { fixture, radios, fills, settle } = await render();
    radios()[2].click();
    await settle();
    expect(fixture.componentInstance.control.value).toBe(3);
    expect(radios()[2].checked).toBe(true);
    expect(fills()).toEqual([1, 1, 1, 0, 0]);
  });

  it('keeps the rating on a press of the chosen star unless clearable', async () => {
    const { fixture, radios, settle } = await render();
    radios()[2].click();
    await settle();
    radios()[2].click();
    await settle();
    expect(fixture.componentInstance.control.value).toBe(3);

    fixture.componentInstance.clearable.set(true);
    await settle();
    radios()[2].click();
    await settle();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(radios().some((r) => r.checked)).toBe(false);
  });

  it('clears with Space on the chosen star when clearable, which a native radio never does', async () => {
    const { fixture, radios, settle } = await render();
    fixture.componentInstance.clearable.set(true);
    fixture.componentInstance.control.setValue(2);
    await settle();
    const space = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    radios()[1].dispatchEvent(space);
    await settle();
    expect(space.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('previews the fill under the pointer and returns to the value when it leaves', async () => {
    const { root, stars, fills, radios, settle } = await render();
    radios()[0].click();
    await settle();
    stars()[3].dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(fills()).toEqual([1, 1, 1, 1, 0]);
    root.querySelector('[role="radiogroup"]')!.dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(fills()).toEqual([1, 0, 0, 0, 0]);
  });

  it('takes the value a form control writes, and follows its disabled state', async () => {
    const { fixture, radios, fills, settle } = await render();
    fixture.componentInstance.control.setValue(2);
    await settle();
    expect(fills()).toEqual([1, 1, 0, 0, 0]);
    fixture.componentInstance.control.disable();
    await settle();
    expect(radios().every((r) => r.disabled)).toBe(true);
  });

  it('is one image named in words when read-only, drawn to the nearest half', async () => {
    const { fixture, root, radios, fills, settle } = await render();
    fixture.componentInstance.readonly.set(true);
    fixture.componentInstance.control.setValue(4.7);
    await settle();
    expect(radios().length).toBe(0);
    const image = root.querySelector('[role="img"]')!;
    const name = image
      .getAttribute('aria-labelledby')!
      .split(' ')
      .map((id) => root.querySelector(`[id="${id}"]`)!.textContent?.trim())
      .join(' ');
    expect(name).toBe('Your rating Rated 4.7 out of 5');
    expect(fills()).toEqual([1, 1, 1, 1, 0.5]);
  });

  it('says "Not rated" for a read-only rating with no value', async () => {
    const { fixture, root, settle } = await render();
    fixture.componentInstance.readonly.set(true);
    await settle();
    expect(root.querySelector('[role="img"]')!.textContent).toContain('Not rated');
  });

  it('takes its words from GOG_CONFIG.labels', async () => {
    const { radios } = await render([
      {
        provide: GOG_CONFIG,
        useValue: {
          labels: { ratingStar: (value: number, max: number) => `${value} von ${max} Sternen` },
        },
      },
    ]);
    expect(radios()[1].getAttribute('aria-label')).toBe('2 von 5 Sternen');
  });
});
