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

@Component({
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    <gog-collapsible [(open)]="open" [disabled]="disabled()">
      <div gogCollapsibleTrigger>Categories</div>
      <div gogCollapsibleContent>Panel</div>
    </gog-collapsible>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DivTriggerHostComponent {
  readonly open = signal(false);
  readonly disabled = signal(false);
}

/** The consumer said what the element is; the directive must not overrule them. */
@Component({
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    <gog-collapsible>
      <div gogCollapsibleTrigger role="link" tabindex="-1">Categories</div>
      <div gogCollapsibleContent>Panel</div>
    </gog-collapsible>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OwnRoleHostComponent {}

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

/**
 * The directive's own TSDoc invites a non-focusable host ("works on any element"), and until
 * 21.5.0 that produced a control announcing `aria-expanded` with no tab stop and no keys — the
 * one combination that strands the person relying on the announcement.
 */
describe('gogCollapsibleTrigger on a non-focusable element', () => {
  let fixture: ComponentFixture<DivTriggerHostComponent>;
  let host: DivTriggerHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivTriggerHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DivTriggerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector('[gogCollapsibleTrigger]') as HTMLElement;
  }

  async function press(key: string): Promise<void> {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('supplies the button semantics the element does not have', () => {
    expect(trigger().getAttribute('role')).toBe('button');
    expect(trigger().getAttribute('tabindex')).toBe('0');
  });

  it('toggles on Enter', async () => {
    await press('Enter');
    expect(host.open()).toBe(true);

    await press('Enter');
    expect(host.open()).toBe(false);
  });

  it('toggles on Space, and swallows the page scroll that key would cause', async () => {
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    trigger().dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.open()).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores keys that do not activate a button', async () => {
    await press('a');
    await press('ArrowDown');

    expect(host.open()).toBe(false);
  });

  it('drops out of the tab order while disabled, and does not toggle', async () => {
    host.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger().getAttribute('tabindex')).toBe('-1');

    await press('Enter');
    expect(host.open()).toBe(false);
  });
});

describe('gogCollapsibleTrigger on an element that already has semantics', () => {
  it('leaves a native button alone, so Enter does not toggle twice', async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CollapsibleHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('[gogCollapsibleTrigger]') as HTMLElement;
    expect(button.getAttribute('role')).toBeNull();
    expect(button.getAttribute('tabindex')).toBeNull();

    // The browser turns Enter into a click on a real button; the directive must not also react,
    // or the panel opens and closes in one press.
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('respects a role and tabindex the consumer set themselves', async () => {
    await TestBed.configureTestingModule({ imports: [OwnRoleHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(OwnRoleHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('[gogCollapsibleTrigger]') as HTMLElement;
    expect(trigger.getAttribute('role')).toBe('link');
    expect(trigger.getAttribute('tabindex')).toBe('-1');
  });
});
