import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CardComponent,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
} from './card.component';
import { GogSize, GogSurfaceVariant } from '../../shared/types';

@Component({
  imports: [
    CardComponent,
    GogCardFooterDirective,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    GogCardMediaDirective,
  ],
  template: `
    <gog-card
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [skeletonLines]="skeletonLines()"
    >
      <img gogCardMedia src="cover.png" alt="" />
      <h3 gogCardHeader>
        @if (withLink()) {
          <a gogCardLink href="/people/ada">Ada Lovelace</a>
        } @else {
          Ada Lovelace
        }
      </h3>
      <p class="body-text">Mathematician</p>
      <div gogCardFooter><button type="button">Open</button></div>
    </gog-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CardHostComponent {
  readonly variant = signal<GogSurfaceVariant>('outlined');
  readonly size = signal<GogSize>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly withLink = signal(false);
  readonly skeletonLines = signal(2);
}

/** No heading at all — there is nothing for the card to name itself with. */
@Component({
  imports: [CardComponent],
  template: `<gog-card><p>Just a surface</p></gog-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeadlessCardHostComponent {}

/** The consumer said what the heading's id is; the card must use theirs, not mint one. */
@Component({
  imports: [CardComponent, GogCardHeaderDirective],
  template: `<gog-card><h3 gogCardHeader id="chosen-by-me">Ada</h3></gog-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OwnHeaderIdHostComponent {}

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardHostComponent>;
  let host: CardHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  function card(): HTMLElement {
    return fixture.nativeElement.querySelector('gog-card');
  }

  function link(): HTMLAnchorElement | null {
    return fixture.nativeElement.querySelector('a');
  }

  it('renders as an outlined, medium card with zero configuration', () => {
    expect(card().className).toContain('gog-card');
    expect(card().className).toContain('gog-card--outlined');
    expect(card().className).toContain('gog-card--md');
  });

  it('maps variant and size onto one class each', async () => {
    host.variant.set('elevated');
    host.size.set('lg');
    await fixture.whenStable();

    expect(card().className).toContain('gog-card--elevated');
    expect(card().className).toContain('gog-card--lg');
    expect(card().className).not.toContain('gog-card--outlined');
    expect(card().className).not.toContain('gog-card--md');
  });

  it('names itself with the projected heading', () => {
    const heading = fixture.nativeElement.querySelector('h3') as HTMLElement;

    expect(heading.id).toMatch(/^gog-card-header-\d+$/);
    expect(card().getAttribute('role')).toBe('group');
    expect(card().getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('marks the projected slots so the global stylesheet can reach them', () => {
    expect(fixture.nativeElement.querySelector('img').className).toContain('gog-card__media');
    expect(fixture.nativeElement.querySelector('h3').className).toContain('gog-card__header');
    expect(
      (fixture.nativeElement.querySelector('[gogCardFooter]') as HTMLElement).className,
    ).toContain('gog-card__footer');
  });

  it('becomes interactive because it holds a real link, not because of an input', async () => {
    expect(card().className).not.toContain('gog-card--interactive');

    host.withLink.set(true);
    await fixture.whenStable();

    expect(card().className).toContain('gog-card--interactive');
    expect(link()!.className).toContain('gog-card__link');
    // Still a plain link: nothing has taken its href, its role or its keyboard behaviour away.
    expect(link()!.getAttribute('href')).toBe('/people/ada');
    expect(link()!.hasAttribute('role')).toBe(false);
  });

  it('announces a loading card as busy and shows placeholders instead of content', async () => {
    host.loading.set(true);
    await fixture.whenStable();

    expect(card().getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('gog-skeleton').length).toBe(2);
    expect(
      (fixture.nativeElement.querySelector('.gog-card__content') as HTMLElement).className,
    ).toContain('gog-card__content--hidden');
    expect(
      (fixture.nativeElement.querySelector('.gog-card__placeholder') as HTMLElement).getAttribute(
        'aria-hidden',
      ),
    ).toBe('true');
  });

  it('leaves aria-busy off when it is not loading', () => {
    expect(card().hasAttribute('aria-busy')).toBe(false);
  });

  it('takes the card link out of the tab order while disabled, and puts it back after', async () => {
    host.withLink.set(true);
    host.disabled.set(true);
    await fixture.whenStable();

    expect(card().getAttribute('aria-disabled')).toBe('true');
    expect(card().className).toContain('gog-card--disabled');
    expect(link()!.getAttribute('tabindex')).toBe('-1');
    expect(link()!.getAttribute('aria-disabled')).toBe('true');

    host.disabled.set(false);
    await fixture.whenStable();

    expect(link()!.hasAttribute('tabindex')).toBe(false);
    expect(link()!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('does the same while loading — a card mid-fetch is not activatable either', async () => {
    host.withLink.set(true);
    host.loading.set(true);
    await fixture.whenStable();

    expect(link()!.getAttribute('tabindex')).toBe('-1');
  });

  it('renders the requested number of placeholder text lines', async () => {
    host.loading.set(true);
    host.skeletonLines.set(4);
    await fixture.whenStable();

    const lines = fixture.nativeElement.querySelectorAll(
      '.gog-card__placeholder gog-skeleton:last-of-type .gog-skeleton__line',
    );
    expect(lines.length).toBe(4);
  });

  it('stays out of the accessibility tree as a group when it has no heading to be named by', async () => {
    const headless = TestBed.createComponent(HeadlessCardHostComponent);
    await headless.whenStable();

    const element = headless.nativeElement.querySelector('gog-card') as HTMLElement;
    expect(element.hasAttribute('role')).toBe(false);
    expect(element.hasAttribute('aria-labelledby')).toBe(false);
  });

  it("keeps a consumer's own heading id", async () => {
    const own = TestBed.createComponent(OwnHeaderIdHostComponent);
    await own.whenStable();

    expect(
      (own.nativeElement.querySelector('gog-card') as HTMLElement).getAttribute('aria-labelledby'),
    ).toBe('chosen-by-me');
  });
});
