import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AlertComponent } from './alert.component';
import type { GogAlertLive, GogSeverity } from '../../shared/types';
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

describe('AlertComponent — the announcement', () => {
  @Component({
    imports: [AlertComponent],
    template: `<gog-alert [severity]="severity()" [live]="live()" heading="Payment failed">
      The card issuer declined the charge.
    </gog-alert>`,
  })
  class Host {
    readonly severity = signal<GogSeverity>('danger');
    readonly live = signal<GogAlertLive | undefined>(undefined);
  }

  const region = (fixture: ComponentFixture<Host>) =>
    (fixture.nativeElement as HTMLElement).querySelector('[aria-live]');

  /*
   * **The structural invariant, which is the whole mechanism.** A live region has to be in the DOM
   * before the text it announces lands inside it, so the region must be a *separate* element that
   * renders empty and is filled a render later — never the visible content with `aria-live` put on
   * it, which arrives with its own text in one insertion and announces nothing.
   *
   * The "empty on the first frame" half is deliberately **not** asserted here: `detectChanges()`
   * flushes `afterNextRender` synchronously, so TestBed cannot observe the gap that a real browser
   * paint creates. Asserting it would have meant asserting the test harness. What is checked is
   * the thing that makes the gap possible at all, and it is the thing a well-meaning simplification
   * would break.
   */
  it('announces through a separate region, not by labelling the visible content', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const live = region(fixture);
    const main = (fixture.nativeElement as HTMLElement).querySelector('.gog-alert__main');
    expect(live).toBeTruthy();
    expect(main).toBeTruthy();
    expect(live!.contains(main!)).toBe(false);
    expect(main!.contains(live!)).toBe(false);
    expect(live!.textContent).toContain('Payment failed');
    expect(live!.textContent).toContain('The card issuer declined the charge.');
  });

  it('defaults danger and warning to assertive, and the rest to polite', async () => {
    const fixture = TestBed.createComponent(Host);
    for (const [severity, expected] of [
      ['danger', 'assertive'],
      ['warning', 'assertive'],
      ['success', 'polite'],
      ['info', 'polite'],
      ['accent', 'polite'],
    ] as const) {
      fixture.componentInstance.severity.set(severity);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(region(fixture)?.getAttribute('aria-live')).toBe(expected);
      expect(region(fixture)?.getAttribute('role')).toBe(
        expected === 'assertive' ? 'alert' : 'status',
      );
    }
  });

  it('renders no region at all when live is off', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.live.set('off');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(region(fixture)).toBeNull();
  });

  it('lets live override the severity default', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.live.set('polite');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(region(fixture)?.getAttribute('aria-live')).toBe('polite');
    expect(region(fixture)?.getAttribute('role')).toBe('status');
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
