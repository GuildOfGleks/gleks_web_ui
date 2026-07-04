import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
} from './accordion.component';

@Component({
  standalone: true,
  imports: [AccordionComponent, GogAccordionHeaderDirective, GogAccordionContentDirective],
  template: `
    <gog-accordion [items]="items" (gogToggle)="lastToggle = $event">
      <ng-template gogAccordionHeader let-item let-open="open">
        <span class="custom-header">{{ item.title }} {{ open ? 'open' : 'closed' }}</span>
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

  it('should render a custom header template and emit toggle events', async () => {
    const hostFixture = TestBed.createComponent(AccordionHostComponent);
    await hostFixture.whenStable();

    const button = hostFixture.nativeElement.querySelector('.gog-accordion__header') as HTMLButtonElement;
    expect(hostFixture.nativeElement.querySelector('.custom-header')?.textContent).toContain('First closed');

    button.click();
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.custom-header')?.textContent).toContain('First open');
    expect(hostFixture.componentInstance.lastToggle).toEqual({
      item: { id: 1, title: 'First' },
      open: true,
    });
  });
});
