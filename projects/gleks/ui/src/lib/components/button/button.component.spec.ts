import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';
import { GOG_CONFIG } from '@guildofgleks/ui/shared';

@Component({
  imports: [ButtonComponent],
  template: `
    <form (submit)="onSubmit($event)">
      <gog-button type="submit" [loading]="loading()" [debounce]="200">Save</gog-button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SubmitHost {
  readonly loading = input(false);
  submits = 0;

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submits++;
  }
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit gogClick when clicked', async () => {
    const clicks: MouseEvent[] = [];
    component.gogClick.subscribe((event) => clicks.push(event));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(clicks.length).toBe(1);
  });

  it('should default to type="button" so it never implicitly submits a form', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.type).toBe('button');
  });

  it('should apply the requested type', async () => {
    fixture.componentRef.setInput('type', 'submit');
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.type).toBe('submit');
  });

  describe('disabled', () => {
    it('should render the native disabled attribute and block clicks', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);

      const clicks: MouseEvent[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));
      button.click();
      await fixture.whenStable();

      expect(clicks.length).toBe(0);
    });

    it('should not set aria-disabled redundantly when natively disabled', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.hasAttribute('aria-disabled')).toBe(false);
    });
  });

  describe('loading', () => {
    it('should stay natively focusable (not use the disabled attribute) while loading', async () => {
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.getAttribute('aria-busy')).toBe('true');
    });

    it('should still block clicks while loading even though the button is not natively disabled', async () => {
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      const clicks: MouseEvent[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      await fixture.whenStable();

      expect(clicks.length).toBe(0);
    });

    it('should render the spinner and visually hide the projected content', async () => {
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('gog-spinner')).not.toBeNull();
      const content = fixture.nativeElement.querySelector('.gog-btn__content') as HTMLElement;
      expect(content.classList.contains('gog-btn__content--hidden')).toBe(true);
    });

    it('should not render aria-busy when not loading', () => {
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.hasAttribute('aria-busy')).toBe(false);
    });
  });

  describe('fullWidth', () => {
    it('should apply the full-width host class so the stylesheet rules take effect', async () => {
      fixture.componentRef.setInput('fullWidth', true);
      await fixture.whenStable();

      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(true);
    });

    it('should not apply the full-width host class by default', () => {
      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(false);
    });
  });

  describe('ariaLabel', () => {
    it('should forward ariaLabel to the native button, not just the host element', async () => {
      fixture.componentRef.setInput('ariaLabel', 'Close dialog');
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Close dialog');
    });

    it('should omit aria-label when not provided', () => {
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.hasAttribute('aria-label')).toBe(false);
    });
  });

  describe('ARIA state and relationship inputs', () => {
    const nativeButton = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    it.each([
      ['ariaPressed', 'aria-pressed', true, 'true'],
      ['ariaPressed', 'aria-pressed', 'mixed', 'mixed'],
      ['ariaExpanded', 'aria-expanded', true, 'true'],
      ['ariaControls', 'aria-controls', 'filters-panel', 'filters-panel'],
      ['ariaHasPopup', 'aria-haspopup', 'dialog', 'dialog'],
      ['ariaHasPopup', 'aria-haspopup', true, 'true'],
    ] as const)(
      'should forward %s to the native button as %s',
      async (inputName, attribute, value, expected) => {
        fixture.componentRef.setInput(inputName, value);
        await fixture.whenStable();

        expect(nativeButton().getAttribute(attribute)).toBe(expected);
      },
    );

    it.each([
      ['ariaPressed', 'aria-pressed'],
      ['ariaExpanded', 'aria-expanded'],
      ['ariaControls', 'aria-controls'],
      ['ariaHasPopup', 'aria-haspopup'],
    ] as const)('should omit %s when unset', (_inputName, attribute) => {
      expect(nativeButton().hasAttribute(attribute)).toBe(false);
    });

    // The distinction the whole feature turns on. A toggle button in its off state must say
    // `aria-pressed="false"`; a button with no `aria-pressed` at all is not a toggle button, so
    // treating `false` like the unset default would silently produce the wrong control.
    it.each([
      ['ariaPressed', 'aria-pressed'],
      ['ariaExpanded', 'aria-expanded'],
    ] as const)(
      'should render %s="false" rather than omitting it',
      async (inputName, attribute) => {
        fixture.componentRef.setInput(inputName, false);
        await fixture.whenStable();

        expect(nativeButton().getAttribute(attribute)).toBe('false');
      },
    );

    it('should keep the attributes off the host element, where they would do nothing', async () => {
      fixture.componentRef.setInput('ariaPressed', true);
      fixture.componentRef.setInput('ariaExpanded', true);
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.hasAttribute('aria-pressed')).toBe(false);
      expect(host.hasAttribute('aria-expanded')).toBe(false);
      expect(nativeButton().getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('variant and size classes', () => {
    it('should apply the variant class', async () => {
      fixture.componentRef.setInput('variant', 'outline');
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.classList.contains('gog-btn--outline')).toBe(true);
      expect(button.classList.contains('gog-btn--primary')).toBe(false);
    });

    it('should apply the size class', async () => {
      fixture.componentRef.setInput('size', 'lg');
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.classList.contains('gog-btn--lg')).toBe(true);
    });

    it('should size the spinner "md" for a "lg" button and "sm" for smaller buttons', async () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      let spinnerDebugEl = fixture.debugElement.query(By.css('gog-spinner'));
      expect(spinnerDebugEl.componentInstance.size()).toBe('md');

      fixture.componentRef.setInput('size', 'sm');
      await fixture.whenStable();

      spinnerDebugEl = fixture.debugElement.query(By.css('gog-spinner'));
      expect(spinnerDebugEl.componentInstance.size()).toBe('sm');
    });
  });

  describe('severity', () => {
    function button(): HTMLButtonElement {
      return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    }

    it('emits no class by default, since accent is the absence of a severity', async () => {
      await fixture.whenStable();

      expect(button().className).not.toMatch(/gog-btn--(accent|success|danger|warning|info)/);
    });

    it('emits the status class, and keeps the size class beside it', async () => {
      fixture.componentRef.setInput('severity', 'danger');
      fixture.componentRef.setInput('size', 'lg');
      await fixture.whenStable();

      expect(button().classList.contains('gog-btn--danger')).toBe(true);
      expect(button().classList.contains('gog-btn--lg')).toBe(true);
    });

    it('composes with variant rather than replacing it', async () => {
      fixture.componentRef.setInput('severity', 'warning');
      fixture.componentRef.setInput('variant', 'ghost');
      await fixture.whenStable();

      expect(button().classList.contains('gog-btn--warning')).toBe(true);
      expect(button().classList.contains('gog-btn--ghost')).toBe(true);
    });

    it('drops the previous status class when the severity changes', async () => {
      fixture.componentRef.setInput('severity', 'info');
      await fixture.whenStable();
      expect(button().classList.contains('gog-btn--info')).toBe(true);

      fixture.componentRef.setInput('severity', 'accent');
      await fixture.whenStable();

      expect(button().classList.contains('gog-btn--info')).toBe(false);
    });
  });

  describe('click throttling', () => {
    it('should emit the first click immediately (leading edge)', async () => {
      const clicks: MouseEvent[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      await fixture.whenStable();

      expect(clicks.length).toBe(1);
    });

    it('should drop clicks that land within the debounce window', async () => {
      fixture.componentRef.setInput('debounce', 200);
      await fixture.whenStable();

      const clicks: MouseEvent[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      button.click();
      button.click();
      await fixture.whenStable();

      expect(clicks.length).toBe(1);
    });

    it('should accept a new click once the debounce window has elapsed', async () => {
      fixture.componentRef.setInput('debounce', 30);
      await fixture.whenStable();

      const clicks: MouseEvent[] = [];
      component.gogClick.subscribe((event) => clicks.push(event));

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      await fixture.whenStable();
      expect(clicks.length).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      button.click();
      await fixture.whenStable();
      expect(clicks.length).toBe(2);
    });

    it('cancels the native activation of a dropped click, and only of a dropped one', async () => {
      fixture.componentRef.setInput('debounce', 200);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      const first = new MouseEvent('click', { bubbles: true, cancelable: true });
      const second = new MouseEvent('click', { bubbles: true, cancelable: true });
      button.dispatchEvent(first);
      button.dispatchEvent(second);

      expect(first.defaultPrevented).toBe(false);
      expect(second.defaultPrevented).toBe(true);
    });

    it('falls back to GOG_CONFIG.button.debounce when the input is unset', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ButtonComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { button: { debounce: 30 } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(ButtonComponent);
      const providedComponent = providedFixture.componentInstance;
      await providedFixture.whenStable();

      expect(providedComponent.debounce()).toBeUndefined();
      expect(providedComponent['resolvedDebounce']()).toBe(30);
    });
  });

  describe('inside a form, with type="submit"', () => {
    async function mountForm(loading: boolean) {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [SubmitHost] }).compileComponents();
      const host = TestBed.createComponent(SubmitHost);
      host.componentRef.setInput('loading', loading);
      await host.whenStable();
      return host;
    }

    it('submits once for clicks inside the debounce window', async () => {
      const host = await mountForm(false);
      const button = host.nativeElement.querySelector('button') as HTMLButtonElement;

      button.click();
      button.click();
      button.click();
      await host.whenStable();

      expect(host.componentInstance.submits).toBe(1);
    });

    it('does not submit while loading, though the button stays focusable', async () => {
      const host = await mountForm(true);
      const button = host.nativeElement.querySelector('button') as HTMLButtonElement;

      button.click();
      await host.whenStable();

      expect(button.disabled).toBe(false);
      expect(host.componentInstance.submits).toBe(0);
    });
  });
});
