import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleComponent } from './collapsible.component';
import { GogCollapsibleContentDirective } from './collapsible-content.directive';
import { GogCollapsibleTriggerDirective } from './collapsible-trigger.directive';

@Component({
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    <gog-collapsible [(open)]="open" [disabled]="disabled()">
      <button gogCollapsibleTrigger>Categories</button>
      <div gogCollapsibleContent>
        <a>Sub A</a>
        <a>Sub B</a>
      </div>
    </gog-collapsible>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CollapsibleHostComponent {
  readonly open = signal(false);
  readonly disabled = signal(false);
}

describe('CollapsibleComponent', () => {
  let fixture: ComponentFixture<CollapsibleHostComponent>;
  let host: CollapsibleHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollapsibleHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  function content(): HTMLElement {
    return fixture.nativeElement.querySelector('div');
  }

  it('renders closed by default', () => {
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(content().classList.contains('gog-collapsible__content--open')).toBe(false);
    expect(content().getAttribute('aria-hidden')).toBe('true');
    expect(content().hasAttribute('inert')).toBe(true);
  });

  it('opens on trigger click and propagates to the bound signal', async () => {
    trigger().click();
    await fixture.whenStable();

    expect(host.open()).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(content().classList.contains('gog-collapsible__content--open')).toBe(true);
    expect(content().getAttribute('aria-hidden')).toBe('false');
    expect(content().hasAttribute('inert')).toBe(false);
  });

  it('closes again on a second click', async () => {
    trigger().click();
    await fixture.whenStable();
    trigger().click();
    await fixture.whenStable();

    expect(host.open()).toBe(false);
  });

  it('reflects external writes to the bound signal', async () => {
    host.open.set(true);
    await fixture.whenStable();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(content().classList.contains('gog-collapsible__content--open')).toBe(true);
  });

  it('links the trigger and content via aria-controls/id', async () => {
    const controls = trigger().getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(content().id).toBe(controls);
  });

  it('does not toggle when disabled', async () => {
    host.disabled.set(true);
    await fixture.whenStable();

    trigger().click();
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(trigger().getAttribute('aria-disabled')).toBe('true');
  });
});
