import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '../../shared/config';
import { ButtonComponent } from '../button/button.component';
import { SpinnerOverlayComponent } from './spinner-overlay/spinner-overlay.component';
import { SpinnerComponent } from './spinner.component';

/**
 * Stands in for a consumer's house loader — which is why its selector is not `gog-*`. The prefix
 * rule exists for components this library ships; this one is deliberately foreign, and naming it
 * `gog-` to satisfy the linter would quietly make the test about the wrong thing.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-house-loader',
  template: `<span class="house-loader">…</span>`,
})
class HouseLoaderComponent {}

/**
 * `GOG_CONFIG.spinner.component` — the one config key that carries markup.
 *
 * The point of it is reach rather than convenience: a `gog-button` in its loading state renders a
 * spinner from its own template and exposes no input for it, so before this key an app's own
 * loader could not get in there at all. The second test is the one that matters; the first only
 * proves the plumbing.
 */
describe('spinner — GOG_CONFIG.spinner', () => {
  @Component({
    imports: [SpinnerComponent, ButtonComponent, SpinnerOverlayComponent],
    template: `
      <gog-spinner />
      <gog-spinner variant="ring" class="explicit" />
      <gog-button [loading]="loading()">Save</gog-button>
      <gog-spinner-overlay [loading]="loading()" class="wrapped">content</gog-spinner-overlay>
      <gog-spinner-overlay [loading]="loading()" variant="ring" class="wrapped-explicit">
        content
      </gog-spinner-overlay>
    `,
  })
  class HostComponent {
    readonly loading = signal(true);
  }

  let fixture: ComponentFixture<HostComponent>;

  async function setUp(config: unknown): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: GOG_CONFIG, useValue: config }],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  }

  function html(): string {
    return (fixture.nativeElement as HTMLElement).innerHTML;
  }

  it('renders the built-in spinner when nothing is configured', async () => {
    await setUp({});

    expect(html()).toContain('gog-spinner__svg');
    expect(html()).not.toContain('house-loader');
  });

  it("puts the app's own component inside a loading gog-button, which has no input for it", async () => {
    await setUp({ spinner: { component: HouseLoaderComponent } });

    const button = (fixture.nativeElement as HTMLElement).querySelector('gog-button');
    expect(button?.querySelector('.house-loader')).toBeTruthy();
    // and the built-in is gone, not merely covered
    expect(button?.querySelector('.gog-spinner__svg')).toBeNull();
  });

  it('lets an instance keep its own variant against the app-wide component', async () => {
    await setUp({ spinner: { component: HouseLoaderComponent } });

    const explicit = (fixture.nativeElement as HTMLElement).querySelector('.explicit');
    expect(explicit?.querySelector('.gog-spinner__ring')).toBeTruthy();
    expect(explicit?.querySelector('.house-loader')).toBeNull();
  });

  it('falls back to a configured variant when no component is given', async () => {
    await setUp({ spinner: { variant: 'ring' } });

    expect(html()).toContain('gog-spinner__ring');
    expect(html()).not.toContain('gog-spinner__svg');
  });

  /**
   * 21.10.0. `gog-spinner-overlay` forwards its own `variant` to the spinner it wraps, and that
   * input used to default to `'runic'` — so the overlay always looked like an instance asking
   * for the built-in, and the key documented as reaching "every spinner the library draws" was
   * silently not reaching the one a consumer uses to cover a whole region. Nothing above catches
   * it: every case here mounts a bare `gog-spinner` or a `gog-button`.
   */
  it("puts the app's own component inside a gog-spinner-overlay", async () => {
    await setUp({ spinner: { component: HouseLoaderComponent } });

    const overlay = (fixture.nativeElement as HTMLElement).querySelector('.wrapped');
    expect(overlay?.querySelector('.house-loader')).toBeTruthy();
    expect(overlay?.querySelector('.gog-spinner__svg')).toBeNull();
  });

  it('lets an overlay that states a variant keep it against the app-wide component', async () => {
    await setUp({ spinner: { component: HouseLoaderComponent } });

    const overlay = (fixture.nativeElement as HTMLElement).querySelector('.wrapped-explicit');
    expect(overlay?.querySelector('.gog-spinner__ring')).toBeTruthy();
    expect(overlay?.querySelector('.house-loader')).toBeNull();
  });

  it('gives an unconfigured overlay the built-in runic spinner, as before', async () => {
    await setUp({});

    const overlay = (fixture.nativeElement as HTMLElement).querySelector('.wrapped');
    expect(overlay?.querySelector('.gog-spinner__svg')).toBeTruthy();
  });

  it('reaches an overlay through spinner.variant too', async () => {
    await setUp({ spinner: { variant: 'ring' } });

    const overlay = (fixture.nativeElement as HTMLElement).querySelector('.wrapped');
    expect(overlay?.querySelector('.gog-spinner__ring')).toBeTruthy();
  });
});
