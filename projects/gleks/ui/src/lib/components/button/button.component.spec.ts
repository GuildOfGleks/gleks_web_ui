import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

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
  });
});
