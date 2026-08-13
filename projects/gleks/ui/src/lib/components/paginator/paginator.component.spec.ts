import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorComponent } from './paginator.component';
import { GOG_CONFIG } from '../../shared/config';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
  });

  function pageButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'));
  }

  function pageNumberLabels(): string[] {
    const children = Array.from(fixture.nativeElement.children) as HTMLElement[];
    return children.slice(1, -1).map((el) => el.textContent?.trim() ?? ''); // drop prev/next
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('fullWidth', () => {
    it('should not apply the auto-width host class by default', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(false);
    });

    it('should apply the auto-width host class when set to false', () => {
      fixture.componentRef.setInput('fullWidth', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(true);
    });
  });

  it('should default to page 1', () => {
    fixture.detectChanges();
    expect(component.page()).toBe(1);
  });

  it('should default to window range mode', () => {
    fixture.detectChanges();
    expect(component.rangeMode()).toBe('window');
  });

  it('should disable the previous button on the first page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    expect(pageButtons()[0].disabled).toBe(true);
  });

  it('should disable the next button on the last page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('page', 5);
    fixture.detectChanges();

    const buttons = pageButtons();
    expect(buttons[buttons.length - 1].disabled).toBe(true);
  });

  it('should update the page model when a page button is clicked', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    pageButtons()[2].click(); // prev, 1, [2], 3, 4, 5, next
    fixture.detectChanges();

    expect(component.page()).toBe(2);
  });

  it('should move to the next/previous page via the arrow buttons', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('page', 2);
    fixture.detectChanges();

    const buttons = pageButtons();
    buttons[buttons.length - 1].click(); // next
    fixture.detectChanges();
    expect(component.page()).toBe(3);

    pageButtons()[0].click(); // prev
    fixture.detectChanges();
    expect(component.page()).toBe(2);
  });

  it('should render every button disabled, and leave the page unchanged on click, while disabled', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const buttons = pageButtons();
    buttons.forEach((button) => expect(button.disabled).toBe(true));

    buttons[2].click();
    fixture.detectChanges();

    expect(component.page()).toBe(1);
  });

  it('should clamp the page down when totalPages shrinks below it', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('page', 5);
    fixture.detectChanges();

    fixture.componentRef.setInput('totalPages', 2);
    fixture.detectChanges();

    expect(component.page()).toBe(2);
  });

  it('should clamp an out-of-range initial page up to 1', () => {
    fixture.componentRef.setInput('page', 0);
    fixture.detectChanges();

    expect(component.page()).toBe(1);
  });

  it('should apply the configured aria-label to the host', () => {
    fixture.componentRef.setInput('ariaLabel', 'Results pagination');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Results pagination');
  });

  describe('window range mode (default)', () => {
    it('should show every page when totalPages fits inside visiblePages', () => {
      fixture.componentRef.setInput('totalPages', 3);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['1', '2', '3']);
    });

    it('should show exactly `visiblePages` page buttons with no ellipsis by default', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.detectChanges();

      expect(pageNumberLabels().length).toBe(5);
      expect(fixture.nativeElement.querySelectorAll('.gog-paginator__ellipsis').length).toBe(0);
    });

    it('should keep the current page centered and slide the window as it moves', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 3);
      fixture.detectChanges();
      expect(pageNumberLabels()).toEqual(['1', '2', '3', '4', '5']);

      fixture.componentRef.setInput('page', 4);
      fixture.detectChanges();
      expect(pageNumberLabels()).toEqual(['2', '3', '4', '5', '6']);
    });

    it('should clamp the window at the start and end instead of shrinking it', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 1);
      fixture.detectChanges();
      expect(pageNumberLabels()).toEqual(['1', '2', '3', '4', '5']);

      fixture.componentRef.setInput('page', 20);
      fixture.detectChanges();
      expect(pageNumberLabels()).toEqual(['16', '17', '18', '19', '20']);
    });

    it('should respect a custom visiblePages count', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.componentRef.setInput('visiblePages', 3);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['9', '10', '11']);
    });

    it('should pin the first page with an ellipsis when showFirstPage is set and it is not adjacent', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.componentRef.setInput('showFirstPage', true);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['1', '…', '8', '9', '10', '11', '12']);
    });

    it('should pin the last page with an ellipsis when showLastPage is set and it is not adjacent', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.componentRef.setInput('showLastPage', true);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['8', '9', '10', '11', '12', '…', '20']);
    });

    it('should not duplicate the pinned boundary or add an ellipsis once the window reaches it', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 2);
      fixture.componentRef.setInput('showFirstPage', true);
      fixture.componentRef.setInput('showLastPage', true);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['1', '2', '3', '4', '5', '…', '20']);
    });
  });

  describe('ellipsis range mode (opt-in, matches gog-table)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rangeMode', 'ellipsis');
    });

    it('should render a button per page when under the sibling window', () => {
      fixture.componentRef.setInput('totalPages', 3);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['1', '2', '3']);
    });

    it('should always pin the first and last page and collapse the rest into an ellipsis', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.detectChanges();

      const ellipses = fixture.nativeElement.querySelectorAll('.gog-paginator__ellipsis');
      expect(ellipses.length).toBe(2);
      expect(pageNumberLabels()).toEqual(['1', '…', '8', '9', '10', '11', '12', '…', '20']);
    });

    it('should respect a custom siblingCount', () => {
      fixture.componentRef.setInput('totalPages', 20);
      fixture.componentRef.setInput('page', 10);
      fixture.componentRef.setInput('siblingCount', 1);
      fixture.detectChanges();

      expect(pageNumberLabels()).toEqual(['1', '…', '9', '10', '11', '…', '20']);
    });
  });

  describe('GOG_CONFIG.labels', () => {
    async function configured(labels: Record<string, unknown>) {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PaginatorComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { labels } }],
      }).compileComponents();

      const f = TestBed.createComponent(PaginatorComponent);
      f.componentRef.setInput('totalPages', 5);
      await f.whenStable();
      f.detectChanges();
      return f;
    }

    const buttonLabels = (f: ComponentFixture<PaginatorComponent>) =>
      [...f.nativeElement.querySelectorAll('button[aria-label]')].map((b) =>
        (b as HTMLElement).getAttribute('aria-label'),
      );

    it('uses the built-in English labels by default', async () => {
      const f = await configured({});
      const labels = buttonLabels(f);

      expect(labels).toContain('Previous page');
      expect(labels).toContain('Next page');
      expect(labels).toContain('Page 1, current page');
      expect(labels).toContain('Go to page 2');
    });

    it('takes the nav name and the step buttons from the config', async () => {
      const f = await configured({
        pagination: 'Seitennummerierung',
        previousPage: 'Zurück',
        nextPage: 'Weiter',
      });

      expect(f.nativeElement.getAttribute('aria-label')).toBe('Seitennummerierung');
      expect(buttonLabels(f)).toContain('Zurück');
      expect(buttonLabels(f)).toContain('Weiter');
    });

    it('formats the per-page names through the configured function', async () => {
      // A function rather than a string: the page number is interpolated, and languages differ
      // on where it goes and what agrees with it.
      const f = await configured({
        page: (page: number, isCurrent: boolean) =>
          isCurrent ? `Seite ${page} von 5, aktuell` : `Zu Seite ${page}`,
      });
      const labels = buttonLabels(f);

      expect(labels).toContain('Seite 1 von 5, aktuell');
      expect(labels).toContain('Zu Seite 3');
    });

    it('lets the instance ariaLabel win over the configured nav name', async () => {
      const f = await configured({ pagination: 'Seitennummerierung' });
      f.componentRef.setInput('ariaLabel', 'Results pagination');
      await f.whenStable();

      expect(f.nativeElement.getAttribute('aria-label')).toBe('Results pagination');
    });
  });
});
