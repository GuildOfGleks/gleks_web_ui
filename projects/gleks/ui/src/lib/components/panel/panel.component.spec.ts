import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  PanelComponent,
} from './panel.component';
import { GogSize, GogSurfaceVariant } from '../../shared/types';

@Component({
  imports: [PanelComponent, GogPanelFooterDirective, GogPanelHeaderDirective],
  template: `
    <gog-panel
      [variant]="variant()"
      [size]="size()"
      [collapsible]="collapsible()"
      [(open)]="open"
      [disabled]="disabled()"
      [loading]="loading()"
    >
      <h2 gogPanelHeader>Notifications</h2>
      <p class="body-text">How and when we contact you.</p>
      <div gogPanelFooter><button type="button">Save</button></div>
    </gog-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PanelHostComponent {
  readonly variant = signal<GogSurfaceVariant>('elevated');
  readonly size = signal<GogSize>('lg');
  readonly collapsible = signal(false);
  readonly open = signal(true);
  readonly disabled = signal(false);
  readonly loading = signal(false);
}

/** Collapsible, with no heading to borrow a name from. */
@Component({
  imports: [PanelComponent],
  template: `<gog-panel [collapsible]="true"><p>Body</p></gog-panel>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeadlessPanelHostComponent {}

describe('PanelComponent', () => {
  let fixture: ComponentFixture<PanelHostComponent>;
  let host: PanelHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  function panel(): HTMLElement {
    return fixture.nativeElement.querySelector('gog-panel');
  }

  function toggle(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.gog-panel__toggle');
  }

  function content(): HTMLElement {
    return fixture.nativeElement.querySelector('.gog-panel__content');
  }

  it('renders as an elevated, large panel with zero configuration', () => {
    expect(panel().className).toContain('gog-panel--elevated');
    expect(panel().className).toContain('gog-panel--lg');
  });

  it('is a region named by its heading', () => {
    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;

    expect(heading.id).toMatch(/^gog-panel-header-\d+$/);
    expect(heading.className).toContain('gog-panel__heading');
    expect(panel().getAttribute('role')).toBe('region');
    expect(panel().getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('has no toggle and no collapsed geometry when it cannot collapse', () => {
    expect(toggle()).toBeNull();
    expect(content().className).toContain('gog-panel__content--static');
  });

  it('collapses through the shared primitive rather than a mechanism of its own', async () => {
    host.collapsible.set(true);
    await fixture.whenStable();

    expect(content().className).toContain('gog-collapsible__content');
    expect(content().className).not.toContain('gog-panel__content--static');
    expect(toggle()!.getAttribute('aria-expanded')).toBe('true');
    expect(toggle()!.getAttribute('aria-controls')).toBe(content().id);
  });

  it('names its toggle after the heading instead of wrapping it', async () => {
    host.collapsible.set(true);
    await fixture.whenStable();

    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    // The heading is still a heading — the toggle borrows its text, it does not swallow it.
    expect(heading.getAttribute('role')).toBeNull();
    expect(toggle()!.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(toggle()!.hasAttribute('aria-label')).toBe(false);
  });

  it('toggles the bound signal, and reflects an external write', async () => {
    host.collapsible.set(true);
    await fixture.whenStable();

    toggle()!.click();
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(panel().className).toContain('gog-panel--closed');
    expect(content().className).not.toContain('gog-collapsible__content--open');

    host.open.set(true);
    await fixture.whenStable();

    expect(panel().className).not.toContain('gog-panel--closed');
    expect(content().className).toContain('gog-collapsible__content--open');
  });

  it('stays open when it cannot collapse, whatever `open` says', async () => {
    host.open.set(false);
    await fixture.whenStable();

    expect(panel().className).not.toContain('gog-panel--closed');
    expect(content().className).toContain('gog-collapsible__content--open');
  });

  it('refuses to toggle while disabled', async () => {
    host.collapsible.set(true);
    host.disabled.set(true);
    await fixture.whenStable();

    expect(panel().getAttribute('aria-disabled')).toBe('true');
    expect(toggle()!.getAttribute('aria-disabled')).toBe('true');

    toggle()!.click();
    await fixture.whenStable();

    expect(host.open()).toBe(true);
  });

  it('announces a loading panel as busy, keeps the heading and replaces the body', async () => {
    host.loading.set(true);
    await fixture.whenStable();

    expect(panel().getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('h2')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('.gog-panel__placeholder gog-skeleton').length,
    ).toBe(1);
    expect(
      (fixture.nativeElement.querySelector('.gog-panel__body') as HTMLElement).className,
    ).toContain('gog-panel__body--hidden');
    // The footer is not part of the body: its actions stay usable while the body loads.
    expect(fixture.nativeElement.querySelector('[gogPanelFooter]')).not.toBeNull();
  });

  it('falls back to a configurable label when there is no heading to name the toggle', async () => {
    const headless = TestBed.createComponent(HeadlessPanelHostComponent);
    await headless.whenStable();

    const element = headless.nativeElement.querySelector('gog-panel') as HTMLElement;
    const button = element.querySelector('.gog-panel__toggle') as HTMLButtonElement;

    expect(element.hasAttribute('role')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Toggle section');
    expect(button.hasAttribute('aria-labelledby')).toBe(false);
  });
});
