import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogPopoverTriggerDirective, PopoverComponent } from './popover.component';

@Component({
  imports: [PopoverComponent, GogPopoverTriggerDirective],
  template: `
    <button id="trigger" type="button" [gogPopoverTrigger]="pop">Details</button>
    <button id="outside" type="button">Elsewhere</button>
    <gog-popover #pop ariaLabel="Order details" (gogClosed)="closed = closed + 1">
      <p>Shipped on 3 October.</p>
      <button id="inside" type="button">Track</button>
    </gog-popover>
  `,
})
class PopoverHost {
  closed = 0;
}

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<PopoverHost>;

  const trigger = () => document.getElementById('trigger') as HTMLButtonElement;
  const panel = () => document.querySelector<HTMLElement>('.gog-popover');

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PopoverHost] }).compileComponents();
    fixture = TestBed.createComponent(PopoverHost);
    document.body.appendChild(fixture.nativeElement);
    await settle();
  });

  afterEach(() => (fixture.nativeElement as HTMLElement).remove());

  it('renders nothing until opened', () => {
    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens from its trigger as a named dialog in <body>, and moves focus inside', async () => {
    trigger().click();
    await settle();
    const opened = panel()!;
    expect(opened.getAttribute('role')).toBe('dialog');
    expect(opened.getAttribute('aria-label')).toBe('Order details');
    expect(opened.closest('.gog-overlay-host')?.parentElement).toBe(document.body);
    expect(document.activeElement?.id).toBe('inside');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(opened.id);
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    trigger().click();
    await settle();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(fixture.componentInstance.closed).toBe(1);
  });

  it('closes on a press outside, leaving focus where it went', async () => {
    trigger().click();
    await settle();
    document.getElementById('outside')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
  });

  it('toggles from its trigger', async () => {
    trigger().click();
    await settle();
    trigger().click();
    await settle();
    expect(panel()).toBeNull();
  });

  it('closes when focus leaves both the panel and the trigger', async () => {
    trigger().click();
    await settle();
    document.getElementById('inside')!.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.getElementById('outside'),
      }),
    );
    await settle();
    expect(panel()).toBeNull();
  });
});
