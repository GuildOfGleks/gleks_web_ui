import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import {
  BreadcrumbsComponent,
  GogBreadcrumbDirective,
  GogBreadcrumbItemDirective,
  type GogBreadcrumbClick,
} from './breadcrumbs.component';

@Component({
  imports: [BreadcrumbsComponent, GogBreadcrumbDirective],
  template: `
    <gog-breadcrumbs [maxItems]="max()" [itemsBefore]="1" [itemsAfter]="2">
      @for (crumb of trail(); track crumb; let last = $last) {
        @if (last) {
          <span *gogBreadcrumb class="crumb">{{ crumb }}</span>
        } @else {
          <a *gogBreadcrumb class="crumb" href="#{{ crumb }}">{{ crumb }}</a>
        }
      }
    </gog-breadcrumbs>
  `,
})
class TrailHost {
  readonly max = signal<number | null>(null);
  readonly trail = signal(['Home', 'Docs', 'Components', 'Forms', 'Avatar']);
}

async function render(providers: unknown[] = []) {
  await TestBed.configureTestingModule({
    imports: [TrailHost],
    providers: providers as never[],
  }).compileComponents();
  const fixture = TestBed.createComponent(TrailHost);
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const items = () => Array.from(root.querySelectorAll<HTMLElement>('.gog-breadcrumbs__item'));
  const crumbs = () => Array.from(root.querySelectorAll<HTMLElement>('.crumb'));
  const more = () => root.querySelector<HTMLButtonElement>('.gog-breadcrumbs__more');
  const update = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, root, items, crumbs, more, update };
}

describe('BreadcrumbsComponent', () => {
  it('is a named landmark holding an ordered list, one item per crumb', async () => {
    const { root, items } = await render();
    const nav = root.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(nav.querySelector(':scope > ol')).not.toBeNull();
    expect(items().length).toBe(5);
  });

  it('marks the last item as the current page, and only that one', async () => {
    const { crumbs } = await render();
    const current = crumbs().filter((el) => el.getAttribute('aria-current') === 'page');
    expect(current.map((el) => el.textContent?.trim())).toEqual(['Avatar']);
  });

  it('moves aria-current when the trail gets a new last item', async () => {
    const { fixture, crumbs, update } = await render();
    fixture.componentInstance.trail.set(['Home', 'Docs']);
    await update();
    expect(crumbs().map((el) => el.getAttribute('aria-current'))).toEqual([null, 'page']);
  });

  it('draws separators between items, hidden from assistive tech, and none after the last', async () => {
    const { items } = await render();
    const separators = items().map((li) => li.querySelector('.gog-breadcrumbs__separator'));
    expect(
      separators.slice(0, -1).every((icon) => icon?.getAttribute('aria-hidden') === 'true'),
    ).toBe(true);
    expect(separators.at(-1)).toBeNull();
  });

  it('keeps the element yours, with its own attributes', async () => {
    const { crumbs } = await render();
    expect(crumbs()[1].tagName).toBe('A');
    expect(crumbs()[1].getAttribute('href')).toBe('#Docs');
  });

  it('collapses the middle past maxItems, keeping itemsBefore and itemsAfter', async () => {
    const { fixture, crumbs, more, update } = await render();
    fixture.componentInstance.max.set(4);
    await update();

    expect(crumbs().map((el) => el.textContent?.trim())).toEqual(['Home', 'Forms', 'Avatar']);
    expect(more()!.getAttribute('aria-label')).toBe('Show full path');
    expect(crumbs().at(-1)!.getAttribute('aria-current')).toBe('page');
  });

  it('expands in place and hands focus to the first item it revealed', async () => {
    const { fixture, crumbs, more, update } = await render();
    fixture.componentInstance.max.set(4);
    await update();

    more()!.focus();
    more()!.click();
    await update();

    expect(more()).toBeNull();
    expect(crumbs().map((el) => el.textContent?.trim())).toEqual([
      'Home',
      'Docs',
      'Components',
      'Forms',
      'Avatar',
    ]);
    expect(document.activeElement?.textContent?.trim()).toBe('Docs');
  });

  it('does not collapse when the kept items would hide nothing', async () => {
    const { fixture, more, update } = await render();
    fixture.componentInstance.trail.set(['Home', 'Docs', 'Avatar']);
    fixture.componentInstance.max.set(2);
    await update();
    expect(more()).toBeNull();
  });

  it('takes its labels from GOG_CONFIG.labels', async () => {
    const { fixture, root, more, update } = await render([
      {
        provide: GOG_CONFIG,
        useValue: { labels: { breadcrumbs: 'Brotkrumen', showBreadcrumbs: 'Ganzen Pfad zeigen' } },
      },
    ]);
    fixture.componentInstance.max.set(3);
    await update();
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Brotkrumen');
    expect(more()!.getAttribute('aria-label')).toBe('Ganzen Pfad zeigen');
  });
});

interface Crumb {
  id: number;
  name: string;
  url?: string;
  count?: number;
}

@Component({
  imports: [BreadcrumbsComponent],
  template: `
    <gog-breadcrumbs
      [items]="trail()"
      itemLabel="name"
      itemHref="url"
      [maxItems]="max()"
      (gogItemClick)="clicked.push($event)"
    />
  `,
})
class DataHost {
  readonly max = signal<number | null>(null);
  readonly trail = signal<Crumb[]>([
    { id: 1, name: 'Home', url: '/' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Orders', url: '/orders' },
    { id: 4, name: '#1042', url: '/orders/1042' },
  ]);
  readonly clicked: GogBreadcrumbClick<Crumb>[] = [];
}

describe('BreadcrumbsComponent with items', () => {
  async function renderData() {
    await TestBed.configureTestingModule({ imports: [DataHost] }).compileComponents();
    const fixture = TestBed.createComponent(DataHost);
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const links = () => Array.from(root.querySelectorAll<HTMLElement>('.gog-breadcrumbs__link'));
    return { fixture, root, links };
  }

  it('draws the array in order: links for parents, the last one the current page as text', async () => {
    const { links } = await renderData();
    expect(links().map((link) => link.textContent?.trim())).toEqual([
      'Home',
      'Sales',
      'Orders',
      '#1042',
    ]);
    expect(links().map((link) => link.tagName)).toEqual(['A', 'BUTTON', 'A', 'SPAN']);
    expect(links()[0].getAttribute('href')).toBe('/');
    expect(links()[3].getAttribute('aria-current')).toBe('page');
    expect(links()[3].hasAttribute('href')).toBe(false);
  });

  it('reports a pressed parent, and lets the app take over the navigation', async () => {
    const { fixture, links } = await renderData();
    links()[2].addEventListener('click', (event) => event.preventDefault());
    links()[2].click();
    links()[1].click();
    const clicked = fixture.componentInstance.clicked;
    expect(clicked.map((c) => [c.item.name, c.index])).toEqual([
      ['Orders', 2],
      ['Sales', 1],
    ]);
    expect(clicked[0].event).toBeInstanceOf(MouseEvent);
  });

  it('collapses the middle of an array as it does elements', async () => {
    const { fixture, root, links } = await renderData();
    fixture.componentInstance.max.set(3);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(links().map((link) => link.textContent?.trim())).toEqual(['Home', 'Orders', '#1042']);
    root.querySelector<HTMLButtonElement>('.gog-breadcrumbs__more')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(links().length).toBe(4);
  });

  it('follows the array as it changes', async () => {
    const { fixture, links } = await renderData();
    fixture.componentInstance.trail.update((trail) => trail.slice(0, 2));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(links().map((link) => [link.tagName, link.textContent?.trim()])).toEqual([
      ['A', 'Home'],
      ['SPAN', 'Sales'],
    ]);
  });

  it("draws an item through a gogBreadcrumbItem template, inside the trail's own link", async () => {
    @Component({
      imports: [BreadcrumbsComponent, GogBreadcrumbItemDirective],
      template: `
        <gog-breadcrumbs [items]="trail" itemLabel="name" itemHref="url">
          <ng-template
            gogBreadcrumbItem
            let-crumb
            let-current="current"
            [gogBreadcrumbItemTypeOf]="trail"
          >
            <em class="custom">{{ crumb.name }}{{ current ? ' (here)' : '' }}</em>
          </ng-template>
        </gog-breadcrumbs>
      `,
    })
    class CustomHost {
      readonly trail: Crumb[] = [
        { id: 1, name: 'Home', url: '/' },
        { id: 2, name: 'Orders' },
      ];
    }
    await TestBed.configureTestingModule({ imports: [CustomHost] }).compileComponents();
    const fixture = TestBed.createComponent(CustomHost);
    await fixture.whenStable();
    fixture.detectChanges();
    const custom = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.gog-breadcrumbs__link .custom'),
    ).map((element) => element.textContent);
    expect(custom).toEqual(['Home', 'Orders (here)']);
  });
});
