import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerOverlayComponent } from './spinner-overlay.component';

describe('SpinnerOverlayComponent', () => {
  let component: SpinnerOverlayComponent;
  let fixture: ComponentFixture<SpinnerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerOverlayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the overlay when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__scrim')).toBeTruthy();
  });

  it('should not render the overlay scrim when not loading', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__scrim')).toBeNull();
  });

  it('should set aria-busy to true only while loading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBeNull();
  });

  it('should always project the wrapped content regardless of loading state', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__content')).toBeTruthy();
  });

  it('should pass the variant through to the inner spinner', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('variant', 'ring');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner__ring')).toBeTruthy();
  });
});

// The scrim stops the pointer; inert stops the keyboard. Focus that was inside waits on the scrim
// and comes back, rather than being dropped on <body> by inert.
describe('SpinnerOverlayComponent — keyboard', () => {
  @Component({
    imports: [SpinnerOverlayComponent],
    template: `<gog-spinner-overlay [loading]="loading()">
      <button class="inside">Refresh</button>
    </gog-spinner-overlay>`,
  })
  class OverlayHost {
    readonly loading = signal(false);
  }

  let fixture: ComponentFixture<OverlayHost>;
  const el = (selector: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OverlayHost] }).compileComponents();
    fixture = TestBed.createComponent(OverlayHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('makes the content inert only while loading', async () => {
    expect(el('.gog-spinner-overlay__content').hasAttribute('inert')).toBe(false);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(el('.gog-spinner-overlay__content').hasAttribute('inert')).toBe(true);
  });

  it('holds focus on the scrim while loading, and gives it back after', async () => {
    const inside = el('button.inside');
    inside.focus();

    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(el('.gog-spinner-overlay__scrim'));

    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(inside);
  });
});
