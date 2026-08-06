import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleComponent } from './collapsible.component';
import { GogCollapsibleContentDirective } from './collapsible-content.directive';
import { GogCollapsibleTriggerDirective } from './collapsible-trigger.directive';

@Component({
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    <gog-collapsible
      [(open)]="open"
      [disabled]="disabled()"
      [collapseOnFocusOut]="collapseOnFocusOut()"
    >
      <button gogCollapsibleTrigger>Categories</button>
      <div gogCollapsibleContent>
        <a tabindex="0">Sub A</a>
        <a tabindex="0">Sub B</a>
      </div>
    </gog-collapsible>
    <button id="outside">Outside</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CollapsibleHostComponent {
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly collapseOnFocusOut = signal(false);
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

  function subLink(index: number): HTMLAnchorElement {
    return fixture.nativeElement.querySelectorAll('a')[index];
  }

  function outsideButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#outside');
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

  describe('collapseOnFocusOut', () => {
    beforeEach(async () => {
      host.open.set(true);
      await fixture.whenStable();
    });

    it('stays open when focus leaves and collapseOnFocusOut is off (default)', async () => {
      subLink(0).dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: outsideButton(), bubbles: true }),
      );
      await fixture.whenStable();

      expect(host.open()).toBe(true);
    });

    it('closes once focus leaves both the trigger and the content', async () => {
      host.collapseOnFocusOut.set(true);
      await fixture.whenStable();

      subLink(1).dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: outsideButton(), bubbles: true }),
      );
      await fixture.whenStable();

      expect(host.open()).toBe(false);
    });

    it('stays open when focus moves between the trigger and the content', async () => {
      host.collapseOnFocusOut.set(true);
      await fixture.whenStable();

      trigger().dispatchEvent(
        new FocusEvent('focusout', { relatedTarget: subLink(0), bubbles: true }),
      );
      await fixture.whenStable();

      expect(host.open()).toBe(true);
    });

    it('closes on a relatedTarget-less focusout (e.g. window losing focus)', async () => {
      host.collapseOnFocusOut.set(true);
      await fixture.whenStable();

      subLink(0).dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }));
      await fixture.whenStable();

      expect(host.open()).toBe(false);
    });
  });
});
