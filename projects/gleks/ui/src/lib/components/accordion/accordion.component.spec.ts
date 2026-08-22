import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SkeletonComponent } from '../skeleton/skeleton.component';

import {
  AccordionComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
} from './accordion.component';

@Component({
  standalone: true,
  imports: [
    AccordionComponent,
    GogAccordionHeaderDirective,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
  ],
  template: `
    <gog-accordion [items]="items" (gogToggle)="lastToggle = $event">
      <ng-template gogAccordionHeader let-item let-open="open">
        <span class="custom-header">{{ item.title }} {{ open ? 'open' : 'closed' }}</span>
      </ng-template>
      <ng-template gogAccordionChevron let-item let-open="open">
        <span class="custom-chevron">{{ item.title }} {{ open ? 'v' : '>' }}</span>
      </ng-template>
      <ng-template gogAccordionContent let-item>
        <span class="custom-body">{{ item.title }} body</span>
      </ng-template>
    </gog-accordion>
  `,
})
class AccordionHostComponent {
  items = [{ id: 1, title: 'First' }];
  lastToggle: unknown = null;
}

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand the first item when requested', () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('expandFirst', true);
    return fixture.whenStable().then(() => {
      const button = fixture.nativeElement.querySelector(
        '.gog-accordion__header',
      ) as HTMLButtonElement;
      const body = fixture.nativeElement.querySelector('.gog-accordion__body') as HTMLElement;

      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(body.classList.contains('gog-accordion__body--open')).toBe(true);
      expect(body.getAttribute('aria-hidden')).toBe('false');
      expect(body.hasAttribute('inert')).toBe(false);
    });
  });

  it('should not re-open the first item after the user closes it and items is replaced with a new reference', async () => {
    const itemsA = [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ];
    fixture.componentRef.setInput('items', itemsA);
    fixture.componentRef.setInput('expandFirst', true);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('true');

    // user manually collapses it
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');

    // a fresh items array (e.g. a refetch) arrives with a new reference but same data
    fixture.componentRef.setInput('items', [...itemsA]);
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should toggle the animated body state when a header is clicked', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;
    const body = fixture.nativeElement.querySelector('.gog-accordion__body') as HTMLElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(body.classList.contains('gog-accordion__body--open')).toBe(false);

    button.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(body.classList.contains('gog-accordion__body--open')).toBe(true);

    button.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(body.classList.contains('gog-accordion__body--open')).toBe(false);
  });

  it('should close the previously open item when a new one is opened in single mode', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('multi', false);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    await fixture.whenStable();
    buttons[1].click();
    await fixture.whenStable();

    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should allow multiple items open simultaneously in multi mode', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('multi', true);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    await fixture.whenStable();
    buttons[1].click();
    await fixture.whenStable();

    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should render a custom header template and emit toggle events', async () => {
    const hostFixture = TestBed.createComponent(AccordionHostComponent);
    await hostFixture.whenStable();

    const button = hostFixture.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;
    expect(hostFixture.nativeElement.querySelector('.custom-header')?.textContent).toContain(
      'First closed',
    );

    button.click();
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.custom-header')?.textContent).toContain(
      'First open',
    );
    expect(hostFixture.componentInstance.lastToggle).toEqual({
      item: { id: 1, title: 'First' },
      open: true,
    });
  });

  it('should move focus with arrow keys and home/end', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
      { id: 3, title: 'Third' },
    ]);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons[1]);

    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons[2]);

    buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should skip disabled items when navigating with arrow keys', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second', disabled: true },
      { id: 3, title: 'Third' },
    ]);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(buttons[2]);
  });

  it('should not toggle a disabled item on click', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First', disabled: true }]);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    button.click();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should allow disabling the default chevron', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    fixture.componentRef.setInput('showChevron', false);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-accordion__chevron')).toBeNull();
  });

  it('should render a custom chevron template', async () => {
    const hostFixture = TestBed.createComponent(AccordionHostComponent);
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.custom-chevron')?.textContent).toContain(
      'First >',
    );

    hostFixture.componentInstance.items = [{ id: 1, title: 'First' }];
    hostFixture.detectChanges();
    hostFixture.nativeElement.querySelector('.gog-accordion__header')?.click();
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.custom-chevron')?.textContent).toContain(
      'First v',
    );
  });

  it('should render skeleton placeholders while loading instead of interactive headers', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    const skeletons = fixture.nativeElement.querySelectorAll('.gog-accordion__item--skeleton');
    expect(skeletons.length).toBe(2);
    expect(
      fixture.nativeElement.querySelector(
        '.gog-accordion__header:not(.gog-accordion__header--skeleton)',
      ),
    ).toBeNull();
    // One title bar per row, plus one chevron placeholder per row.
    expect(fixture.nativeElement.querySelectorAll('gog-skeleton[shape="text"]').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('gog-skeleton[shape="circle"]').length).toBe(2);
  });

  /*
   * The skeleton bars are `aria-hidden` and the real headers are not rendered while loading, so
   * without `aria-busy` the component is not "loading" to a screen reader — it is *empty*. See
   * the "Loading states" rule in `api-design.instructions.md`.
   */
  it('should mark itself busy while loading', async () => {
    expect((fixture.nativeElement as HTMLElement).hasAttribute('aria-busy')).toBe(false);

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).hasAttribute('aria-busy')).toBe(false);
  });

  /*
   * The placeholder exists to hold the shape the content will take. A row whose chevron only
   * appears once the data lands is the one thing it is supposed to prevent — and the widths are
   * cycled rather than uniform because titles are not all one length.
   */
  it('should give the placeholder rows the silhouette the real rows have', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    const chevrons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header--skeleton .gog-accordion__chevron',
    );
    expect(chevrons.length).toBe(2);

    // `width` is a signal input, so it is read off the instance — it never lands in the DOM.
    // Filtered to the title bars: the chevron placeholders are circles at a flat `100%`.
    const widths = fixture.debugElement
      .queryAll(By.directive(SkeletonComponent))
      .map((bar) => bar.componentInstance as SkeletonComponent)
      .filter((bar) => bar.shape() === 'text')
      .map((bar) => bar.width());

    expect(widths.length).toBe(2);
    expect(new Set(widths).size).toBe(widths.length);
  });

  it('should leave the chevron placeholder out when showChevron is off', async () => {
    fixture.componentRef.setInput('showChevron', false);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('gog-skeleton[shape="circle"]')).toBeNull();
  });

  it('should fall back to skeletonCount rows while loading when items is still empty', async () => {
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.gog-accordion__item--skeleton').length).toBe(3);
  });

  it('should respect a custom skeletonCount while items is empty', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('skeletonCount', 5);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.gog-accordion__item--skeleton').length).toBe(5);
  });

  it('should auto-rotate the default chevron but leave a custom chevron template alone', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixture.whenStable();

    const defaultChevron = fixture.nativeElement.querySelector('.gog-accordion__chevron');
    expect(defaultChevron.classList.contains('gog-accordion__chevron--auto-rotate')).toBe(true);

    const hostFixture = TestBed.createComponent(AccordionHostComponent);
    await hostFixture.whenStable();

    const customChevron = hostFixture.nativeElement.querySelector('.gog-accordion__chevron');
    expect(customChevron.classList.contains('gog-accordion__chevron--auto-rotate')).toBe(false);
  });

  it('should wrap headers in role="heading" when headingLevel is set', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    fixture.componentRef.setInput('headingLevel', 3);
    await fixture.whenStable();

    const heading = fixture.nativeElement.querySelector('.gog-accordion__heading') as HTMLElement;
    expect(heading).not.toBeNull();
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('3');
    expect(heading.querySelector('.gog-accordion__header')).not.toBeNull();
  });

  it('should not render a heading wrapper when headingLevel is unset', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-accordion__heading')).toBeNull();
  });

  it('should generate distinct button/body ids across multiple instances so ARIA wiring never collides', async () => {
    const fixtureA = TestBed.createComponent(AccordionComponent);
    fixtureA.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixtureA.whenStable();

    const fixtureB = TestBed.createComponent(AccordionComponent);
    fixtureB.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixtureB.whenStable();

    const buttonA = fixtureA.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;
    const buttonB = fixtureB.nativeElement.querySelector(
      '.gog-accordion__header',
    ) as HTMLButtonElement;

    expect(buttonA.id).not.toBe(buttonB.id);
    expect(buttonA.getAttribute('aria-controls')).not.toBe(buttonB.getAttribute('aria-controls'));
  });

  it('should support external control via the openIds model', async () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    await fixture.whenStable();

    fixture.componentRef.setInput('openIds', new Set([2]));
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.gog-accordion__header',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });
});
