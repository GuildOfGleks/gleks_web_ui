import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  GogEmptyStateMediaDirective,
  type GogEmptyStateHeadingLevel,
} from './empty-state.component';

@Component({
  imports: [EmptyStateComponent, GogEmptyStateActionsDirective],
  template: `
    @if (shown()) {
      <gog-empty-state
        heading="No results"
        iconName="search"
        [headingLevel]="level()"
        [live]="live()"
        size="lg"
      >
        Nothing matches "{{ query() }}".
        <div gogEmptyStateActions><button type="button">Clear filters</button></div>
      </gog-empty-state>
    }
  `,
})
class Host {
  readonly shown = signal(true);
  readonly query = signal('invoice');
  readonly level = signal<GogEmptyStateHeadingLevel | null>(null);
  readonly live = signal<'polite' | 'off'>('polite');
}

@Component({
  imports: [EmptyStateComponent, GogEmptyStateMediaDirective],
  template: `
    <gog-empty-state heading="Nothing here" iconName="search">
      <svg gogEmptyStateMedia viewBox="0 0 10 10"></svg>
    </gog-empty-state>
  `,
})
class MediaHost {}

/** A MutationObserver reports on a microtask; let it run, then render what it set. */
const flush = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
};

async function render() {
  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const region = () => root.querySelector('[role="status"]');
  return { fixture, root, region };
}

describe('EmptyStateComponent', () => {
  it('mounts its live region empty, then fills it with the title and description only', async () => {
    const { fixture, region } = await render();
    // The region exists from the first render; the text lands in it afterwards.
    expect(region()?.getAttribute('aria-live')).toBe('polite');
    await flush(fixture);
    expect(region()?.textContent?.trim()).toBe('No results Nothing matches "invoice".');
    expect(region()?.textContent).not.toContain('Clear filters');
  });

  it('says the new answer when the message changes while it stays mounted', async () => {
    const { fixture, region } = await render();
    await flush(fixture);
    fixture.componentInstance.query.set('invoice 2024');
    fixture.detectChanges();
    await flush(fixture);
    expect(region()?.textContent).toContain('Nothing matches "invoice 2024".');
  });

  it('announces nothing with live="off"', async () => {
    const { fixture, region } = await render();
    fixture.componentInstance.live.set('off');
    fixture.detectChanges();
    await flush(fixture);
    fixture.componentInstance.query.set('other');
    fixture.detectChanges();
    await flush(fixture);
    expect(region()?.textContent?.trim()).toBe('');
  });

  it('renders the title as text by default and as a heading at the level asked for', async () => {
    const { fixture, root } = await render();
    expect(root.querySelector('.gog-empty-state__heading')?.tagName).toBe('P');
    fixture.componentInstance.level.set(3);
    fixture.detectChanges();
    expect(root.querySelector('.gog-empty-state__heading')?.tagName).toBe('H3');
  });

  it('draws its icon decoratively and projects the actions', async () => {
    const { root } = await render();
    const icon = root.querySelector('gog-icon.gog-empty-state__icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('.gog-empty-state__actions button')?.textContent).toBe(
      'Clear filters',
    );
    expect(root.querySelector('gog-empty-state')?.classList).toContain('gog-empty-state--lg');
  });

  it('shows projected media in place of the icon, hidden from assistive tech', async () => {
    await TestBed.configureTestingModule({ imports: [MediaHost] }).compileComponents();
    const fixture = TestBed.createComponent(MediaHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('gog-icon')).toBeNull();
    expect(root.querySelector('.gog-empty-state__media')?.getAttribute('aria-hidden')).toBe('true');
  });
});
