import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AlertComponent } from './alert.component';
import { IconComponent } from '../icon/icon.component';
import { GOG_CONFIG } from '../../shared/config';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the accent severity, which claims nothing', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-alert')).toBe(true);
    expect(host.classList.contains('gog-alert--accent')).toBe(true);
    expect(host.classList.contains('gog-alert--has-icon')).toBe(true);
  });

  it('should map each severity to its own class', async () => {
    for (const severity of ['success', 'danger', 'warning', 'info'] as const) {
      fixture.componentRef.setInput('severity', severity);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        (fixture.nativeElement as HTMLElement).classList.contains(`gog-alert--${severity}`),
      ).toBe(true);
    }
  });

  /*
   * The severity's glyph is the component's, not the consumer's, so a danger alert never shows a
   * checkmark because somebody forgot to set the icon. `'accent'` borrows `info`'s deliberately:
   * there is no glyph for "this is a message", and inventing one would say something the severity
   * does not.
   */
  it('should derive the icon from the severity', async () => {
    // Read off the `gog-icon` instance rather than a DOM attribute: the icon injects its SVG
    // through `[innerHTML]` and reflects nothing, so `ng-reflect-*` is a dev-only accident to
    // assert on. This is the input the component actually passes down.
    const iconNameFor = async (severity: string) => {
      fixture.componentRef.setInput('severity', severity);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture.debugElement.query(By.directive(IconComponent)).componentInstance.name();
    };

    expect(await iconNameFor('accent')).toBe('info');
    expect(await iconNameFor('success')).toBe('success');
    expect(await iconNameFor('danger')).toBe('error');
    expect(await iconNameFor('warning')).toBe('warning');
    expect(await iconNameFor('info')).toBe('info');
  });

  it('should let iconName override the severity’s own glyph', async () => {
    fixture.componentRef.setInput('severity', 'danger');
    fixture.componentRef.setInput('iconName', 'lock');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.directive(IconComponent)).componentInstance.name()).toBe(
      'lock',
    );
  });

  it('should suppress the icon when iconName is explicitly null', async () => {
    fixture.componentRef.setInput('iconName', null);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-alert--has-icon')).toBe(false);
    expect(host.querySelector('.gog-alert__icon')).toBeNull();
  });

  it('should render a heading only when one is given', async () => {
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-alert__heading')).toBeNull();

    fixture.componentRef.setInput('heading', 'Payment failed');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.gog-alert__heading')?.textContent,
    ).toContain('Payment failed');
  });

  it('should render no close button unless it is dismissible', async () => {
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-alert__close')).toBeNull();

    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-alert__close')).toBeTruthy();
  });

  /*
   * Pressed, not removed. The alert stays in the DOM and the consumer decides — a component that
   * removed itself would take the focused element with it, which is `docs/alert.md` §3 and
   * iteration 2's work.
   */
  it('should emit dismissed without removing itself', async () => {
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted = 0;
    component.dismissed.subscribe(() => emitted++);

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.gog-alert__close button',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(emitted).toBe(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('.gog-alert__close')).toBeTruthy();
  });
});

describe('AlertComponent — projected content', () => {
  @Component({
    imports: [AlertComponent],
    template: `<gog-alert severity="danger">The card issuer declined the charge.</gog-alert>`,
  })
  class Host {}

  it('should project its body', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();

    const body = (fixture.nativeElement as HTMLElement).querySelector('.gog-alert__body');
    expect(body?.textContent).toContain('The card issuer declined the charge.');
  });
});

describe('AlertComponent — GOG_CONFIG.labels.closeAlert', () => {
  it('should name the dismiss button from the config when one is provided', async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        { provide: GOG_CONFIG, useValue: { labels: { closeAlert: 'Meldung schliessen' } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.gog-alert__close button',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Meldung schliessen');
  });
});
