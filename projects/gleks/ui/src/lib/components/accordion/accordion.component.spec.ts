import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';

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
      const button = fixture.nativeElement.querySelector('.gog-accordion__header') as HTMLButtonElement;
      const body = fixture.nativeElement.querySelector('.gog-accordion__body') as HTMLElement;

      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(body.classList.contains('gog-accordion__body--open')).toBe(true);
      expect(body.getAttribute('aria-hidden')).toBe('false');
      expect(body.hasAttribute('inert')).toBe(false);
    });
  });

  it('should toggle the animated body state when a header is clicked', async () => {
    fixture.componentRef.setInput('items', [{ id: 1, title: 'First' }]);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.gog-accordion__header') as HTMLButtonElement;
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
});
