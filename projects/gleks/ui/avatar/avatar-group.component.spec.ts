import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import { AvatarGroupComponent } from './avatar-group.component';
import { AvatarComponent } from './avatar.component';

@Component({
  imports: [AvatarComponent, AvatarGroupComponent],
  template: `
    <gog-avatar-group [max]="max()" size="sm" ariaLabel="Assignees">
      @for (person of people(); track person) {
        <gog-avatar [name]="person" />
      }
    </gog-avatar-group>
  `,
})
class GroupHost {
  readonly max = signal<number | null>(null);
  readonly people = signal(['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Edsger Dijkstra']);
}

async function render(providers: unknown[] = []) {
  await TestBed.configureTestingModule({
    imports: [GroupHost],
    providers: providers as never[],
  }).compileComponents();
  const fixture = TestBed.createComponent(GroupHost);
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const group = root.querySelector<HTMLElement>('gog-avatar-group')!;
  const projected = () =>
    Array.from(group.querySelectorAll<HTMLElement>('gog-avatar:not(.gog-avatar-group__more)'));
  const drawn = () =>
    projected().filter((el) => !el.classList.contains('gog-avatar-group__overflowed'));
  const more = () => group.querySelector<HTMLElement>('.gog-avatar-group__more');
  const update = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, group, projected, drawn, more, update };
}

describe('AvatarGroupComponent', () => {
  it('is a named group that draws every avatar when there is no max', async () => {
    const { group, drawn, more } = await render();
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Assignees');
    expect(drawn().length).toBe(4);
    expect(more()).toBeNull();
  });

  it('counts the +N avatar in max, and names it for the ones it stands for', async () => {
    const { fixture, drawn, more, update } = await render();
    fixture.componentInstance.max.set(3);
    await update();

    // Three slots: two avatars and "+2".
    expect(drawn().map((el) => el.getAttribute('aria-label'))).toEqual([
      'Ada Lovelace',
      'Grace Hopper',
    ]);
    expect(more()!.getAttribute('aria-label')).toBe('2 more');
    expect(more()!.textContent!.trim()).toBe('+2');
  });

  it('draws them all again once the max is no longer exceeded', async () => {
    const { fixture, drawn, more, update } = await render();
    fixture.componentInstance.max.set(3);
    await update();
    fixture.componentInstance.max.set(4);
    await update();

    expect(drawn().length).toBe(4);
    expect(more()).toBeNull();
  });

  it('follows the avatars it is given, not the ones it started with', async () => {
    const { fixture, drawn, more, update } = await render();
    fixture.componentInstance.max.set(3);
    fixture.componentInstance.people.update((people) => [...people, 'Barbara Liskov']);
    await update();

    expect(drawn().length).toBe(2);
    expect(more()!.getAttribute('aria-label')).toBe('3 more');
  });

  it('draws 99+ past 99 and keeps the exact count in the name', async () => {
    const { fixture, more, update } = await render();
    fixture.componentInstance.people.set(Array.from({ length: 130 }, (_, i) => `Person ${i}`));
    fixture.componentInstance.max.set(5);
    await update();

    expect(more()!.textContent!.trim()).toBe('99+');
    expect(more()!.getAttribute('aria-label')).toBe('126 more');
  });

  it('takes the +N name from GOG_CONFIG.labels.moreAvatars', async () => {
    const { fixture, more, update } = await render([
      { provide: GOG_CONFIG, useValue: { labels: { moreAvatars: (n: number) => `${n} weitere` } } },
    ]);
    fixture.componentInstance.max.set(2);
    await update();

    expect(more()!.getAttribute('aria-label')).toBe('3 weitere');
  });

  it('sizes the whole row through the avatar override token', async () => {
    const { group } = await render();
    expect(group.style.getPropertyValue('--gog-avatar-size')).toBe('var(--gog-avatar-sm-size)');
  });
});
