import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogTabContentDirective, TabComponent } from './tab.component';
import { GogTabHeaderDirective, TabsComponent } from './tabs.component';

@Component({
  imports: [TabsComponent, TabComponent],
  template: `
    <gog-tabs [(activeIndex)]="index" [align]="align()" ariaLabel="Разделы">
      <gog-tab label="Профиль">профиль</gog-tab>
      <gog-tab label="Настройки" iconName="info">настройки</gog-tab>
      <gog-tab label="Архив" [disabled]="archiveDisabled()">архив</gog-tab>
      <gog-tab label="История">история</gog-tab>
    </gog-tabs>
  `,
})
class TabsHost {
  readonly index = signal(0);
  readonly align = signal<'start' | 'center' | 'end' | 'stretch'>('start');
  readonly archiveDisabled = signal(true);
}

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsHost>;
  let host: TabsHost;

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function headers(): HTMLButtonElement[] {
    return Array.from(root().querySelectorAll('button[role="tab"]'));
  }

  function panels(): HTMLElement[] {
    return Array.from(root().querySelectorAll('gog-tab'));
  }

  function keydown(key: string, target: HTMLElement): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabsHost] }).compileComponents();
    fixture = TestBed.createComponent(TabsHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should build one header per projected tab', () => {
    expect(headers().length).toBe(4);
    expect(headers()[0].textContent?.trim()).toBe('Профиль');
  });

  it('should wire the ARIA tabs pattern', () => {
    const tablist = root().querySelector('[role="tablist"]')!;
    expect(tablist.getAttribute('aria-label')).toBe('Разделы');
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');

    expect(headers()[0].getAttribute('aria-selected')).toBe('true');
    expect(headers()[1].getAttribute('aria-selected')).toBe('false');
    // Each header points at its panel, and each panel back at its header.
    expect(headers()[0].getAttribute('aria-controls')).toBe(panels()[0].id);
    expect(panels()[0].getAttribute('aria-labelledby')).toBe(headers()[0].id);
    expect(panels()[0].getAttribute('role')).toBe('tabpanel');
  });

  it('should show only the active panel', () => {
    expect(panels()[0].hasAttribute('hidden')).toBe(false);
    expect(panels()[1].hasAttribute('hidden')).toBe(true);
    expect(panels()[2].hasAttribute('hidden')).toBe(true);
  });

  it('should keep inactive panels in the DOM so their state survives', () => {
    // Eager content is hidden, not destroyed — that is what preserves scroll position and
    // half-typed input across a tab switch.
    expect(panels()[1].textContent?.trim()).toBe('настройки');
  });

  it('should switch on click', () => {
    headers()[1].click();
    fixture.detectChanges();

    expect(host.index()).toBe(1);
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
    expect(panels()[0].hasAttribute('hidden')).toBe(true);
  });

  it('should ignore a click on a disabled tab', () => {
    headers()[2].click();
    fixture.detectChanges();

    expect(host.index()).toBe(0);
    expect(headers()[2].disabled).toBe(true);
  });

  it('should fall back to the first enabled tab when activeIndex points at a disabled one', () => {
    host.index.set(2);
    fixture.detectChanges();

    expect(headers()[0].getAttribute('aria-selected')).toBe('true');
    expect(panels()[2].hasAttribute('hidden')).toBe(true);
  });

  it('should clamp an out-of-range activeIndex instead of showing nothing', () => {
    host.index.set(99);
    fixture.detectChanges();

    expect(headers()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should follow a tab becoming enabled', () => {
    host.index.set(2);
    host.archiveDisabled.set(false);
    fixture.detectChanges();

    expect(headers()[2].getAttribute('aria-selected')).toBe('true');
  });

  describe('roving tabindex', () => {
    it('should expose exactly one tab stop, on the active header', () => {
      expect(headers().filter((header) => header.tabIndex === 0).length).toBe(1);
      expect(headers()[0].tabIndex).toBe(0);
    });

    it('should move the tab stop with the selection', () => {
      headers()[1].click();
      fixture.detectChanges();

      expect(headers()[1].tabIndex).toBe(0);
      expect(headers()[0].tabIndex).toBe(-1);
    });
  });

  describe('keyboard', () => {
    it('should move and activate with ArrowRight', () => {
      headers()[0].focus();
      keydown('ArrowRight', headers()[0]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(headers()[1]);
      expect(host.index()).toBe(1);
    });

    it('should skip a disabled tab', () => {
      headers()[1].focus();
      keydown('ArrowRight', headers()[1]);
      fixture.detectChanges();

      expect(document.activeElement).toBe(headers()[3]);
      expect(host.index()).toBe(3);
    });

    it('should jump to the first and last enabled tab with Home/End', () => {
      headers()[1].focus();
      keydown('End', headers()[1]);
      fixture.detectChanges();
      expect(host.index()).toBe(3);

      keydown('Home', headers()[3]);
      fixture.detectChanges();
      expect(host.index()).toBe(0);
    });

    it('should leave the vertical arrows alone while horizontal', () => {
      headers()[0].focus();
      keydown('ArrowDown', headers()[0]);
      fixture.detectChanges();

      expect(host.index()).toBe(0);
      expect(document.activeElement).toBe(headers()[0]);
    });
  });

  it('should make the active panel focusable so keyboard users can reach the content', () => {
    expect(panels()[0].getAttribute('tabindex')).toBe('0');
    expect(panels()[1].getAttribute('tabindex')).toBeNull();
  });

  it('should map alignment to a class', () => {
    host.align.set('stretch');
    fixture.detectChanges();

    expect(root().querySelector('gog-tabs')?.classList.contains('gog-tabs--align-stretch')).toBe(
      true,
    );
  });
});

@Component({
  imports: [TabsComponent, TabComponent],
  template: `
    <gog-tabs [(activeIndex)]="index" (gogTabChange)="changes.push($event)">
      <gog-tab label="Один">один</gog-tab>
      <gog-tab label="Два">два</gog-tab>
    </gog-tabs>
  `,
})
class OutputHost {
  readonly index = signal(0);
  readonly changes: number[] = [];
}

describe('TabsComponent — gogTabChange', () => {
  it('should emit once per real change and not on a re-click of the active tab', async () => {
    await TestBed.configureTestingModule({ imports: [OutputHost] }).compileComponents();
    const fixture = TestBed.createComponent(OutputHost);
    await fixture.whenStable();
    fixture.detectChanges();

    const headers = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        'button[role="tab"]',
      ),
    );

    headers[1].click();
    fixture.detectChanges();
    headers[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.changes).toEqual([1]);
  });
});

@Component({
  imports: [TabsComponent, TabComponent, GogTabContentDirective],
  template: `
    <gog-tabs [(activeIndex)]="index">
      <gog-tab label="Сразу">
        <span class="eager">сразу</span>
      </gog-tab>
      <gog-tab label="Лениво">
        <ng-template gogTabContent>
          <span class="lazy">лениво</span>
        </ng-template>
      </gog-tab>
    </gog-tabs>
  `,
})
class LazyHost {
  readonly index = signal(0);
}

describe('TabsComponent — lazy content', () => {
  let fixture: ComponentFixture<LazyHost>;

  function lazy(): Element | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.lazy');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LazyHost] }).compileComponents();
    fixture = TestBed.createComponent(LazyHost);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should not build a gogTabContent template before its tab is shown', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.eager')).toBeTruthy();
    expect(lazy()).toBeNull();
  });

  it('should build it on first activation', async () => {
    fixture.componentInstance.index.set(1);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(lazy()).toBeTruthy();
  });

  it('should keep it alive after leaving the tab again', async () => {
    fixture.componentInstance.index.set(1);
    await fixture.whenStable();
    fixture.detectChanges();
    const built = lazy();

    fixture.componentInstance.index.set(0);
    await fixture.whenStable();
    fixture.detectChanges();

    // Same node, not a rebuilt one: a lazy tab pays its cost once and then behaves like an
    // eager one, so nothing typed into it is lost by switching away.
    expect(lazy()).toBe(built);
  });
});

@Component({
  imports: [TabsComponent, TabComponent, GogTabHeaderDirective],
  template: `
    <gog-tabs>
      <ng-template gogTabHeader let-tab let-active="active">
        <span class="custom-header">{{ tab.label() }}{{ active ? '*' : '' }}</span>
      </ng-template>
      <gog-tab label="Первый">1</gog-tab>
      <gog-tab label="Второй">2</gog-tab>
    </gog-tabs>
  `,
})
class HeaderSlotHost {}

describe('TabsComponent — gogTabHeader slot', () => {
  it('should render the projected header with its typed context', async () => {
    await TestBed.configureTestingModule({ imports: [HeaderSlotHost] }).compileComponents();
    const fixture = TestBed.createComponent(HeaderSlotHost);
    await fixture.whenStable();
    fixture.detectChanges();

    const custom = (fixture.nativeElement as HTMLElement).querySelectorAll('.custom-header');
    expect(custom.length).toBe(2);
    expect(custom[0].textContent?.trim()).toBe('Первый*');
    expect(custom[1].textContent?.trim()).toBe('Второй');
  });
});
