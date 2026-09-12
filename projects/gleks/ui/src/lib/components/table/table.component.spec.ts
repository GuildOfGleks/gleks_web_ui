import { Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import {
  TableComponent,
  type GogTableRowClickEvent,
  type GogTableSelectionMode,
  type GogTableSortEvent,
} from './table.component';
import { GogColumn, GogColumnBodyDirective, GogColumnHeaderDirective } from './column';
import { PaginatorComponent } from '../paginator/paginator.component';
import { ScrollComponent } from '../scroll/scroll.component';

interface Row {
  id: number;
  name: string;
}

const DEFAULT_ROWS: Row[] = [
  { id: 2, name: 'Bravo' },
  { id: 1, name: 'Alpha' },
  { id: 3, name: 'Charlie' },
];

@Component({
  standalone: true,
  imports: [TableComponent, GogColumn, GogColumnBodyDirective, GogColumnHeaderDirective],
  template: `
    <gog-table
      [value]="rows()"
      [pageSize]="pageSize()"
      [loading]="loading()"
      [showRowNumbers]="showRowNumbers()"
      [emptyPlaceholder]="emptyPlaceholder()"
    >
      <gog-column field="id" header="ID" [sortable]="true">
        <ng-template gogColumnHeader><em class="custom-header">ID#</em></ng-template>
      </gog-column>
      <gog-column field="name" header="Name" [sortable]="true">
        <ng-template gogColumnBody let-row
          ><strong class="custom-body">{{ $any(row).name }}</strong></ng-template
        >
      </gog-column>
    </gog-table>
  `,
})
class TableHostComponent {
  readonly rows = input<Row[]>(DEFAULT_ROWS);
  readonly pageSize = input(0);
  readonly loading = input(false);
  readonly showRowNumbers = input(true);
  readonly emptyPlaceholder = input('-');
}

describe('TableComponent', () => {
  let component: TableComponent<object>;
  let fixture: ComponentFixture<TableComponent<object>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fullWidth', () => {
    it('should be 100% wide by default', () => {
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('100%');
    });

    it('should shrink to fit its content when set to false', async () => {
      fixture.componentRef.setInput('fullWidth', false);
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).style.width).toBe('fit-content');
    });

    it('should also shrink the inner <table>, not just the host', async () => {
      // table-layout:fixed doesn't resolve a percentage width against a shrink-to-fit
      // ancestor the way an ordinary block box would, so the host alone reporting
      // fit-content isn't enough — the <table> element itself needs the same override,
      // or it keeps demanding its old 100%-of-something width and drags the host along.
      const table = fixture.nativeElement.querySelector('table.gog-table') as HTMLTableElement;
      expect(table.style.width).toBe('100%');

      fixture.componentRef.setInput('fullWidth', false);
      await fixture.whenStable();

      expect(table.style.width).toBe('fit-content');
    });

    /*
     * jsdom does not lay a table out, so the clipping itself cannot be asserted here — the
     * measurement is in the showcase and in the commit message. What a spec *can* pin is the
     * pairing, which is the part that was wrong: `fit-content` and `table-layout: fixed`
     * together split the width evenly instead of measuring the columns, and cut the widest
     * header off.
     */
    it('should lay columns out automatically when it is not full width', async () => {
      const table = fixture.nativeElement.querySelector('table.gog-table') as HTMLTableElement;
      expect(table.classList.contains('gog-table--auto-layout')).toBe(false);

      fixture.componentRef.setInput('fullWidth', false);
      await fixture.whenStable();

      expect(table.classList.contains('gog-table--auto-layout')).toBe(true);
    });
  });

  /*
   * A loading table replaces its rows with one spinner cell and dims its header, so without this
   * it announces neither rows nor a reason there are none. The rule is in
   * `api-design.instructions.md`; `gog-table` was one of its two known violations until 21.6.0.
   */
  it('should mark itself busy while loading', async () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.hasAttribute('aria-busy')).toBe(false);

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(host.getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    expect(host.hasAttribute('aria-busy')).toBe(false);
  });

  describe('maxHeight', () => {
    /** `axis` is a signal input, so it is read off the instance — it never lands in the DOM. */
    function scroller(): { axis: string; maxHeight: string } {
      const debugEl = fixture.debugElement.query(By.directive(ScrollComponent));
      return {
        axis: (debugEl.componentInstance as ScrollComponent).axis(),
        maxHeight: (debugEl.nativeElement as HTMLElement).style.maxHeight,
      };
    }

    /*
     * jsdom does not lay out or resolve `position: sticky`, so what the header actually does is
     * verified in the showcase (both axes scrolling, measured). What a spec can hold onto is the
     * pairing that makes it possible — and the half that is easy to regress is the *negative*
     * one: an uncapped table must leave its vertical axis alone, or every table becomes a scroll
     * container and takes the consumer's own scrolling region out of its descendants' sticky
     * chain. That regression was measured at 147px during this fix.
     */
    it('should leave the vertical axis alone until it has been capped', () => {
      expect(scroller().axis).toBe('horizontal');
      expect(scroller().maxHeight).toBe('');
    });

    it('should own its vertical scrolling once maxHeight is set', async () => {
      fixture.componentRef.setInput('maxHeight', '260px');
      await fixture.whenStable();

      expect(scroller().axis).toBe('both');
      expect(scroller().maxHeight).toBe('260px');
    });
  });

  it('should sort rows by the configured field', () => {
    fixture.componentRef.setInput('value', [
      { id: 2, name: 'Bravo' },
      { id: 1, name: 'Alpha' },
    ]);

    component.sortState.set({ field: 'id', direction: 'asc' });

    expect((component.sortedData() as { id: number; name: string }[]).map((row) => row.id)).toEqual(
      [1, 2],
    );
  });

  it('should use the configured empty placeholder', () => {
    fixture.componentRef.setInput('emptyPlaceholder', '—');
    fixture.detectChanges();

    expect(component.emptyPlaceholder()).toBe('—');
  });

  it('sorts strings numeric-aware via the default Intl.Collator comparator', () => {
    fixture.componentRef.setInput('value', [
      { id: 1, name: 'item10' },
      { id: 2, name: 'item2' },
    ]);

    component.sortState.set({ field: 'name', direction: 'asc' });

    expect(component.sortedData().map((row) => (row as Row).name)).toEqual(['item2', 'item10']);
  });

  it('resolves nested dot-path fields via getCellValue', () => {
    const row = { profile: { address: { city: 'Kyiv' } } };
    expect(component.getCellValue(row as never, 'profile.address.city')).toBe('Kyiv');
    expect(component.getCellValue(row as never, 'profile.missing.city')).toBeUndefined();
  });
});

describe('TableComponent with a custom column comparator', () => {
  @Component({
    standalone: true,
    imports: [TableComponent, GogColumn],
    template: `
      <gog-table [value]="rows">
        <gog-column field="name" [sortable]="true" [comparator]="reverseAlpha"></gog-column>
      </gog-table>
    `,
  })
  class TableCustomComparatorHostComponent {
    readonly rows = [{ name: 'Alpha' }, { name: 'Bravo' }, { name: 'Charlie' }];
    readonly reverseAlpha = (a: unknown, b: unknown) => (a === b ? 0 : a! < b! ? 1 : -1);
  }

  it("uses the column's comparator instead of the default when sorting", async () => {
    await TestBed.configureTestingModule({
      imports: [TableCustomComparatorHostComponent],
    }).compileComponents();

    const hostFixture = TestBed.createComponent(TableCustomComparatorHostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const table = hostFixture.debugElement.query(By.directive(TableComponent))
      .componentInstance as TableComponent<{ name: string }>;
    table.toggleSort(table.columns()[0]);
    await hostFixture.whenStable();

    expect(table.sortedData().map((row) => row.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });
});

describe('TableComponent with projected columns and templates', () => {
  let hostFixture: ComponentFixture<TableHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TableHostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();
  });

  function headerCells(): HTMLElement[] {
    return Array.from(hostFixture.nativeElement.querySelectorAll('.gog-table__th'));
  }

  function bodyRows(): HTMLElement[] {
    return Array.from(hostFixture.nativeElement.querySelectorAll('.gog-table__row'));
  }

  it('cycles asc -> desc -> none when the same sortable header is clicked repeatedly', async () => {
    const idHeader = headerCells()[1]; // [0] is the row-number header
    idHeader.click();
    await hostFixture.whenStable();
    expect(idHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(bodyRows()[0].textContent).toContain('1');

    idHeader.click();
    await hostFixture.whenStable();
    expect(idHeader.getAttribute('aria-sort')).toBe('descending');
    expect(bodyRows()[0].textContent).toContain('3');

    idHeader.click();
    await hostFixture.whenStable();
    expect(idHeader.getAttribute('aria-sort')).toBeNull();
    // back to insertion order
    expect(bodyRows()[0].textContent).toContain('2');
  });

  it('activates sorting via keyboard (Enter/Space) on the header', async () => {
    const idHeader = headerCells()[1];
    idHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await hostFixture.whenStable();

    expect(idHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('renders custom header and body cell templates instead of the defaults', async () => {
    expect(hostFixture.nativeElement.querySelector('.custom-header')?.textContent).toContain('ID#');
    expect(hostFixture.nativeElement.querySelectorAll('.custom-body').length).toBe(
      DEFAULT_ROWS.length,
    );
  });

  it('shows the empty state with the configured placeholder when there are no rows', async () => {
    hostFixture.componentRef.setInput('rows', []);
    await hostFixture.whenStable();

    const empty = hostFixture.nativeElement.querySelector('.gog-table__empty') as HTMLElement;
    expect(empty).toBeTruthy();
    expect(empty.getAttribute('colspan')).toBe('3'); // 2 columns + row-number column
  });

  it('shows a single loading cell spanning every column while loading', async () => {
    hostFixture.componentRef.setInput('loading', true);
    await hostFixture.whenStable();

    const loadingCell = hostFixture.nativeElement.querySelector(
      '.gog-table__loading-cell',
    ) as HTMLElement;
    expect(loadingCell).toBeTruthy();
    expect(loadingCell.getAttribute('colspan')).toBe('3');
    expect(hostFixture.nativeElement.querySelector('.gog-table__row')).toBeNull();
  });

  describe('pagination', () => {
    beforeEach(async () => {
      hostFixture.componentRef.setInput('pageSize', 2);
      await hostFixture.whenStable();
    });

    it('shows only pageSize rows per page and numbers rows globally', () => {
      expect(bodyRows().length).toBe(2);
      const rowNumbers = Array.from(
        hostFixture.nativeElement.querySelectorAll('.gog-table__td--num'),
      ).map((el) => (el as HTMLElement).textContent?.trim());
      expect(rowNumbers).toEqual(['1', '2']);
    });

    it('navigates to the next page and continues row numbering', async () => {
      const paginationButtons = hostFixture.nativeElement.querySelectorAll(
        '.gog-table__pagination button',
      ) as NodeListOf<HTMLButtonElement>;
      const nextButton = paginationButtons[paginationButtons.length - 1];
      nextButton.click();
      await hostFixture.whenStable();

      expect(bodyRows().length).toBe(1);
      const rowNumbers = Array.from(
        hostFixture.nativeElement.querySelectorAll('.gog-table__td--num'),
      ).map((el) => (el as HTMLElement).textContent?.trim());
      expect(rowNumbers).toEqual(['3']);
    });

    it('clamps the current page back when the data set shrinks', async () => {
      const table = hostFixture.debugElement.query(By.directive(TableComponent))
        .componentInstance as TableComponent<Row>;
      table.currentPage.set(2);
      await hostFixture.whenStable();
      expect(table.currentPage()).toBe(2);

      hostFixture.componentRef.setInput('rows', [{ id: 1, name: 'Alpha' }]);
      await hostFixture.whenStable();

      expect(table.currentPage()).toBe(1);
    });
  });
});

/**
 * A second host for the column-scoped templates, exercising the typed context (`row`, `value`,
 * `index`) that the host above does not read.
 */
@Component({
  standalone: true,
  imports: [TableComponent, GogColumn, GogColumnBodyDirective, GogColumnHeaderDirective],
  template: `
    <gog-table [value]="rows">
      <gog-column field="id" header="ID">
        <ng-template gogColumnHeader let-header>
          <em class="scoped-header">{{ header }}#</em>
        </ng-template>
      </gog-column>
      <gog-column field="name" header="Name">
        <ng-template gogColumnBody let-row let-value="value" let-i="index">
          <strong class="scoped-body">{{ value }}/{{ i }}/{{ $any(row).id }}</strong>
        </ng-template>
      </gog-column>
    </gog-table>
  `,
})
class ScopedTemplateHostComponent {
  readonly rows: Row[] = [{ id: 7, name: 'Delta' }];
}

describe('TableComponent — column-scoped templates', () => {
  let fixture: ComponentFixture<ScopedTemplateHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopedTemplateHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ScopedTemplateHostComponent);
    await fixture.whenStable();
  });

  it('renders a gogColumnHeader template with the column header as context', () => {
    const header = fixture.debugElement.query(By.css('.scoped-header'));
    expect(header.nativeElement.textContent.trim()).toBe('ID#');
  });

  it('renders a gogColumnBody template with row, resolved value and index', () => {
    const cell = fixture.debugElement.query(By.css('.scoped-body'));
    expect(cell.nativeElement.textContent.trim()).toBe('Delta/0/7');
  });

  it('leaves columns without a template on the default text rendering', () => {
    // showRowNumbers defaults to true, so the first cell is the row number; `id` is the second.
    const cells = fixture.debugElement.queryAll(By.css('.gog-table__td'));
    expect(cells[0].nativeElement.textContent.trim()).toBe('1');
    // the id column has only a header template, so its cell is still plain text
    expect(cells[1].nativeElement.textContent.trim()).toBe('7');
  });
});

describe('TableComponent — outputs, lazy mode and selection', () => {
  interface Person {
    id: number;
    name: string;
  }

  const PAGE_1: Person[] = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Bravo' },
  ];

  @Component({
    imports: [TableComponent, GogColumn],
    template: `
      <gog-table
        [value]="rows()"
        [pageSize]="pageSize()"
        [lazy]="lazy()"
        [totalRecords]="totalRecords()"
        [interactiveRows]="interactiveRows()"
        [selectionMode]="selectionMode()"
        [showSelectionColumn]="showSelectionColumn()"
        [dataKey]="dataKey()"
        [(selection)]="selection"
        [showTotal]="true"
        (gogSortChange)="sortEvents.push($event)"
        (gogPageChange)="pageEvents.push($event)"
        (gogRowClick)="rowClicks.push($event)"
      >
        <gog-column field="id" header="ID" [sortable]="true" />
        <gog-column field="name" header="Name" [sortable]="true" />
      </gog-table>
    `,
  })
  class Host {
    readonly rows = signal<Person[]>(PAGE_1);
    readonly pageSize = signal(0);
    readonly lazy = signal(false);
    readonly totalRecords = signal<number | null>(null);
    readonly interactiveRows = signal(false);
    readonly selectionMode = signal<GogTableSelectionMode>('none');
    readonly showSelectionColumn = signal(true);
    readonly dataKey = signal('');
    readonly selection = signal<Person[]>([]);

    readonly sortEvents: GogTableSortEvent[] = [];
    readonly pageEvents: number[] = [];
    readonly rowClicks: GogTableRowClickEvent<Person>[] = [];
  }

  let fixture: ComponentFixture<Host>;
  let host: Host;

  const rows = () => fixture.nativeElement.querySelectorAll('tbody tr.gog-table__row');
  const headers = () => fixture.nativeElement.querySelectorAll('th.gog-table__th');
  /**
   * By label, not by index: the row-number and selection columns shift the positions around, and
   * an index here silently starts clicking the wrong header the moment either is toggled.
   */
  const header = (label: string) =>
    [...headers()].find((h) => (h as HTMLElement).textContent?.trim().startsWith(label)) as
      HTMLElement | undefined;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  describe('gogSortChange', () => {
    it('emits the asc → desc → cleared cycle', async () => {
      const idHeader = header('ID')!;

      idHeader.click();
      await settle();
      idHeader.click();
      await settle();
      idHeader.click();
      await settle();

      expect(host.sortEvents).toEqual([
        { field: 'id', direction: 'asc' },
        { field: 'id', direction: 'desc' },
        { field: '', direction: null },
      ]);
    });

    it('does not emit for a non-sortable column', async () => {
      // Both columns here are sortable; assert the guard by clicking the row-number header,
      // which is not a column at all.
      const numHeader = fixture.nativeElement.querySelector('.gog-table__th--num') as HTMLElement;
      numHeader?.click();
      await settle();

      expect(host.sortEvents).toEqual([]);
    });
  });

  describe('gogPageChange', () => {
    beforeEach(async () => {
      host.rows.set([...PAGE_1, { id: 3, name: 'Charlie' }, { id: 4, name: 'Delta' }]);
      host.pageSize.set(2);
      await settle();
    });

    it('does not fire on the initial render', () => {
      expect(host.pageEvents).toEqual([]);
    });

    it('fires with the new 1-based page when the paginator moves', async () => {
      const next = fixture.nativeElement.querySelector(
        'gog-paginator button[aria-label="Next page"]',
      ) as HTMLButtonElement;
      next.click();
      await settle();

      expect(host.pageEvents).toEqual([2]);
    });

    it('stays silent for the page reset that a new sort causes', async () => {
      const next = fixture.nativeElement.querySelector(
        'gog-paginator button[aria-label="Next page"]',
      ) as HTMLButtonElement;
      next.click();
      await settle();
      expect(host.pageEvents).toEqual([2]);

      // Sorting resets to page 1. That reset belongs to the sort — emitting it as a page change
      // too would make a lazy consumer fetch twice for one user action.
      header('ID')!.click();
      await settle();

      expect(host.sortEvents.length).toBe(1);
      expect(host.pageEvents).toEqual([2]);
    });
  });

  describe('gogRowClick', () => {
    it('emits the row, its index on the page, and the original event', async () => {
      (rows()[1] as HTMLElement).click();
      await settle();

      expect(host.rowClicks.length).toBe(1);
      expect(host.rowClicks[0].row).toEqual({ id: 2, name: 'Bravo' });
      expect(host.rowClicks[0].index).toBe(1);
      expect(host.rowClicks[0].originalEvent).toBeInstanceOf(MouseEvent);
    });

    it('leaves rows out of the tab order unless interactiveRows is on', async () => {
      expect((rows()[0] as HTMLElement).getAttribute('tabindex')).toBeNull();

      host.interactiveRows.set(true);
      await settle();

      expect((rows()[0] as HTMLElement).getAttribute('tabindex')).toBe('0');
    });

    it('activates on Enter and Space only when interactiveRows is on', async () => {
      const row = rows()[0] as HTMLElement;

      row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await settle();
      expect(host.rowClicks).toEqual([]);

      host.interactiveRows.set(true);
      await settle();

      row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      row.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await settle();

      expect(host.rowClicks.length).toBe(2);
      expect(host.rowClicks[0].originalEvent).toBeInstanceOf(KeyboardEvent);
    });
  });

  describe('lazy mode', () => {
    beforeEach(async () => {
      host.lazy.set(true);
      host.pageSize.set(2);
      host.totalRecords.set(10);
      await settle();
    });

    it('renders value as given, without slicing it to the page size', async () => {
      host.rows.set([...PAGE_1, { id: 3, name: 'Charlie' }]);
      await settle();

      // Eager mode would show 2 of 3 here; lazy trusts the server's page.
      expect(rows().length).toBe(3);
    });

    it('never re-sorts the page it was handed', async () => {
      host.rows.set([
        { id: 9, name: 'Zulu' },
        { id: 1, name: 'Alpha' },
      ]);
      await settle();

      header('ID')!.click();
      await settle();

      const cells = [...fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2)')].map(
        (c) => (c as HTMLElement).textContent?.trim(),
      );
      expect(cells).toEqual(['9', '1']);
      expect(host.sortEvents).toEqual([{ field: 'id', direction: 'asc' }]);
    });

    it('drives the paginator from totalRecords, not from value.length', () => {
      // 10 records at 2 per page = 5 pages, from a value holding only 2 rows.
      const pageButtons = [...fixture.nativeElement.querySelectorAll('gog-paginator button')]
        .map((b) => (b as HTMLElement).textContent?.trim())
        .filter((t) => t && /^\d+$/.test(t));
      expect(pageButtons).toContain('5');
    });

    it('reports totalRecords in the total label', () => {
      const total = fixture.nativeElement.querySelector('.gog-table__total') as HTMLElement;
      expect(total.textContent).toContain('10');
    });

    it('numbers rows against the current page', async () => {
      const next = fixture.nativeElement.querySelector(
        'gog-paginator button[aria-label="Next page"]',
      ) as HTMLButtonElement;
      next.click();
      await settle();

      const numbers = [...fixture.nativeElement.querySelectorAll('.gog-table__td--num')].map((c) =>
        (c as HTMLElement).textContent?.trim(),
      );
      expect(numbers).toEqual(['3', '4']);
    });

    it('hides pagination when totalRecords is missing', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.totalRecords.set(null);
      await settle();

      expect(fixture.nativeElement.querySelector('gog-paginator')).toBeNull();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('selection', () => {
    beforeEach(async () => {
      host.selectionMode.set('multiple');
      host.dataKey.set('id');
      await settle();
    });

    it('adds a checkbox column, and none when selectionMode is none', async () => {
      expect(fixture.nativeElement.querySelectorAll('.gog-table__td--select').length).toBe(2);

      host.selectionMode.set('none');
      await settle();
      expect(fixture.nativeElement.querySelector('.gog-table__td--select')).toBeNull();
    });

    it('selects and deselects a row through its checkbox', async () => {
      const box = fixture.nativeElement.querySelector(
        '.gog-table__td--select input',
      ) as HTMLInputElement;

      box.click();
      await settle();
      expect(host.selection()).toEqual([{ id: 1, name: 'Alpha' }]);

      box.click();
      await settle();
      expect(host.selection()).toEqual([]);
    });

    it('keeps at most one row in single mode', async () => {
      host.selectionMode.set('single');
      await settle();

      const boxes = fixture.nativeElement.querySelectorAll('.gog-table__td--select input');
      (boxes[0] as HTMLInputElement).click();
      await settle();
      (boxes[1] as HTMLInputElement).click();
      await settle();

      expect(host.selection()).toEqual([{ id: 2, name: 'Bravo' }]);
    });

    it('offers select-all only in multiple mode', async () => {
      expect(fixture.nativeElement.querySelector('.gog-table__th--select input')).toBeTruthy();

      host.selectionMode.set('single');
      await settle();
      expect(fixture.nativeElement.querySelector('.gog-table__th--select input')).toBeNull();
    });

    it('select-all covers the current page and leaves other pages alone', async () => {
      host.rows.set([...PAGE_1, { id: 3, name: 'Charlie' }, { id: 4, name: 'Delta' }]);
      host.pageSize.set(2);
      host.selection.set([{ id: 4, name: 'Delta' }]);
      await settle();

      const all = fixture.nativeElement.querySelector(
        '.gog-table__th--select input',
      ) as HTMLInputElement;
      all.click();
      await settle();

      // Delta is on page 2 and must survive; page 1's two rows join it.
      expect(
        host
          .selection()
          .map((r) => r.id)
          .sort(),
      ).toEqual([1, 2, 4]);
    });

    it('matches rows by dataKey, so a refetch of equal data keeps the selection', async () => {
      const box = fixture.nativeElement.querySelector(
        '.gog-table__td--select input',
      ) as HTMLInputElement;
      box.click();
      await settle();

      // New object identities, same ids — what a server refetch produces.
      host.rows.set([
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Bravo' },
      ]);
      await settle();

      expect(
        (fixture.nativeElement.querySelector('.gog-table__td--select input') as HTMLInputElement)
          .checked,
      ).toBe(true);
    });

    it('marks selected rows for assistive tech and styling', async () => {
      const box = fixture.nativeElement.querySelector(
        '.gog-table__td--select input',
      ) as HTMLInputElement;
      box.click();
      await settle();

      const row = rows()[0] as HTMLElement;
      expect(row.getAttribute('aria-selected')).toBe('true');
      expect(row.classList.contains('gog-table__row--selected')).toBe(true);
    });

    it('does not let ticking the checkbox count as a row click', async () => {
      host.interactiveRows.set(true);
      await settle();

      (
        fixture.nativeElement.querySelector('.gog-table__td--select input') as HTMLInputElement
      ).click();
      await settle();

      expect(host.selection().length).toBe(1);
      expect(host.rowClicks).toEqual([]);
    });

    it('can hide the checkbox column while keeping selection on', async () => {
      host.showSelectionColumn.set(false);
      await settle();

      expect(fixture.nativeElement.querySelector('.gog-table__td--select')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('tbody tr.gog-table__row').length).toBe(2);
    });
  });
});

describe('TableComponent — page size', () => {
  interface Person {
    id: number;
    name: string;
  }

  const ROWS: Person[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
  }));

  @Component({
    imports: [TableComponent, GogColumn],
    template: `
      <gog-table
        [value]="ROWS"
        [(pageSize)]="pageSize"
        [showPageSizeSelect]="showSelect()"
        [pageSizeOptions]="options()"
        (gogPageChange)="pageEvents.push($event)"
      >
        <gog-column field="id" header="ID" [sortable]="true" />
        <gog-column field="name" header="Name" />
      </gog-table>
    `,
  })
  class Host {
    readonly ROWS = ROWS;
    readonly pageSize = signal(10);
    readonly showSelect = signal(true);
    readonly options = signal<number[] | undefined>(undefined);
    readonly pageEvents: number[] = [];
  }

  let fixture: ComponentFixture<Host>;
  let host: Host;

  const bodyRows = () => fixture.nativeElement.querySelectorAll('tbody tr.gog-table__row');
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  it('renders the select inside its paginator', () => {
    expect(fixture.nativeElement.querySelector('gog-paginator gog-select')).toBeTruthy();
  });

  it('slices to the bound page size, and follows it when the binding changes', async () => {
    expect(bodyRows().length).toBe(10);

    host.pageSize.set(20);
    await settle();

    expect(bodyRows().length).toBe(20);
  });

  it('writes a size chosen in the paginator back through the table model', async () => {
    // The point of `pageSize` being a `model` rather than an `input`: no intermediate signal
    // between the select and whatever the consumer bound.
    const paginator = fixture.debugElement.query(By.directive(PaginatorComponent));
    paginator.componentInstance.pageSize.set(20);
    await settle();

    expect(host.pageSize()).toBe(20);
    expect(bodyRows().length).toBe(20);
  });

  it('returns to page 1 when the size changes, without reporting it as a page change', async () => {
    const next = fixture.nativeElement.querySelector(
      'gog-paginator button[aria-label="Next page"]',
    ) as HTMLButtonElement;
    next.click();
    await settle();
    expect(host.pageEvents).toEqual([2]);

    host.pageSize.set(20);
    await settle();

    const firstCell = (bodyRows()[0] as HTMLElement).querySelector(
      'td:nth-child(2)',
    ) as HTMLElement;
    expect(firstCell.textContent?.trim()).toBe('1');
    // The reset belongs to the size change; the consumer already knows from `pageSizeChange`.
    expect(host.pageEvents).toEqual([2]);
  });

  it('keeps the footer when a size leaves only one page, so the choice stays reversible', async () => {
    host.pageSize.set(50);
    await settle();

    // 25 rows at 50 per page is a single page — without the select the paginator would hide and
    // strand the user on 50.
    expect(fixture.nativeElement.querySelector('gog-paginator')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('gog-paginator gog-select')).toBeTruthy();
  });

  it('hides the footer at one page when the select is off', async () => {
    host.showSelect.set(false);
    host.pageSize.set(50);
    await settle();

    expect(fixture.nativeElement.querySelector('gog-paginator')).toBeNull();
  });

  it('forwards custom options to the paginator', async () => {
    host.options.set([5, 15]);
    await settle();

    const paginator = fixture.debugElement.query(By.directive(PaginatorComponent));
    expect(paginator.componentInstance.pageSizeOptions()).toEqual([5, 15]);
  });
});

/*
 * Windowing — see `docs/table-virtualization.md`.
 *
 * jsdom has no layout, so the window runs on its seed: the constant 40px row height and the
 * viewport resolved from `maxHeight`. That is the same pair that governs the first frame in a real
 * browser, which is the frame worth covering — the corrections that follow are `GogVariableWindow`'s
 * own specs.
 */
describe('TableComponent — virtualize', () => {
  let fixture: ComponentFixture<TableComponent<object>>;

  const manyRows = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Row ${i}` }));

  function bodyRows(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr.gog-table__row'),
    );
  }

  function spacers(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr.gog-table__spacer'),
    );
  }

  async function setUp(inputs: Record<string, unknown> = {}): Promise<void> {
    fixture.componentRef.setInput('value', manyRows);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    await fixture.whenStable();
  });

  it('is off by default, and a thousand rows are a thousand <tr>', async () => {
    await setUp();

    expect(bodyRows().length).toBe(1000);
    expect(spacers().length).toBe(0);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('table')?.getAttribute('aria-rowcount'),
    ).toBeNull();
  });

  it('renders a window, and stands the rest of the list up with a spacer', async () => {
    await setUp({ virtualize: true, maxHeight: '400px' });

    const rendered = bodyRows();
    expect(rendered.length).toBeLessThan(30);
    expect(rendered.length).toBeGreaterThan(0);

    // Nothing above the first row, so only the trailing spacer exists.
    expect(spacers().length).toBe(1);
    expect(spacers()[0].style.height).toBe(`${(1000 - rendered.length) * 40}px`);
  });

  /*
   * A `<tbody>` takes rows and nothing else, so the spacer is a `<tr>` — and it must carry no
   * border, background or padding, or it reads as a row that is there.
   */
  it('spaces with a <tr> whose cell spans the table', async () => {
    await setUp({ virtualize: true, maxHeight: '400px', showRowNumbers: true });

    const spacer = spacers()[0];
    expect(spacer.tagName).toBe('TR');
    expect(spacer.getAttribute('aria-hidden')).toBe('true');
    const cell = spacer.querySelector('td')!;
    const headerCells = (fixture.nativeElement as HTMLElement).querySelectorAll('thead th').length;
    expect(Number(cell.getAttribute('colspan'))).toBe(headerCells);
  });

  it('announces the whole grid, not the window', async () => {
    await setUp({ virtualize: true, maxHeight: '400px' });

    const table = (fixture.nativeElement as HTMLElement).querySelector('table')!;
    // The header is row 1, so a 1000-row body is 1001.
    expect(table.getAttribute('aria-rowcount')).toBe('1001');
    expect(bodyRows()[0].getAttribute('aria-rowindex')).toBe('2');
  });

  describe('the indices that would have changed meaning', () => {
    /*
     * `$index` inside the loop is the position in the *window* once there is one. Three things
     * read it and every one of them is a promise already made: `gogRowClick.index` is documented
     * as the index within the page, the row-number column shows it, and it reaches every
     * consumer's cell template as `GogColumnBodyContext.index`.
     */
    it('keeps gogRowClick.index the index within the page', async () => {
      await setUp({ virtualize: true, maxHeight: '400px' });
      const seen: GogTableRowClickEvent<object>[] = [];
      fixture.componentInstance.gogRowClick.subscribe((e) => seen.push(e));

      // Scroll far enough that the window starts well past the top.
      const viewport = (fixture.nativeElement as HTMLElement).querySelector(
        '.gog-scroll__viewport',
      ) as HTMLElement;
      Object.defineProperty(viewport, 'clientHeight', { value: 400, configurable: true });
      viewport.scrollTop = 8000;
      viewport.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      fixture.detectChanges();
      await fixture.whenStable();

      const first = bodyRows()[0];
      expect(first.getAttribute('data-gog-row-index')).not.toBe('0');
      first.click();

      expect(seen).toHaveLength(1);
      expect(seen[0].index).toBe(Number(first.getAttribute('data-gog-row-index')));
      expect((seen[0].row as { id: number }).id).toBe(seen[0].index);
    });

    it('keeps the row-number column counting from the top of the page', async () => {
      await setUp({ virtualize: true, maxHeight: '400px', showRowNumbers: true });

      const viewport = (fixture.nativeElement as HTMLElement).querySelector(
        '.gog-scroll__viewport',
      ) as HTMLElement;
      Object.defineProperty(viewport, 'clientHeight', { value: 400, configurable: true });
      viewport.scrollTop = 8000;
      viewport.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      fixture.detectChanges();
      await fixture.whenStable();

      const first = bodyRows()[0];
      const realIndex = Number(first.getAttribute('data-gog-row-index'));
      expect(realIndex).toBeGreaterThan(0);
      expect(first.querySelector('.gog-table__td--num')?.textContent?.trim()).toBe(
        String(realIndex + 1),
      );
    });
  });

  describe('what it refuses to do', () => {
    /*
     * Both are hard requirements, measured rather than preferred: without `maxHeight` the table
     * never scrolls vertically on its own, and `fullWidth="false"` means `table-layout: auto`,
     * which sizes columns from the rendered rows.
     */
    /*
     * This one passes twice over, and the second reason is the interesting one: with no
     * `maxHeight` there is also no viewport, and `GogVariableWindow` degrades to the whole list
     * rather than to an empty one. The guard makes the refusal explicit and gives the dev-mode
     * warning something to say; without it the table would still render everything, silently.
     */
    it('does nothing without maxHeight', async () => {
      await setUp({ virtualize: true });

      expect(bodyRows().length).toBe(1000);
      expect(spacers().length).toBe(0);
    });

    it('does nothing without fullWidth', async () => {
      await setUp({ virtualize: true, maxHeight: '400px', fullWidth: false });

      expect(bodyRows().length).toBe(1000);
      expect(spacers().length).toBe(0);
    });
  });

  /*
   * Regression, and it was found live rather than here.
   *
   * The effect that clears the cached heights on a new page or sort calls `reset()`, and `reset()`
   * *reads* the measurement signal to decide whether it has anything to clear. Called bare inside
   * an effect, that read becomes one of the effect's dependencies — so measuring wrote the signal,
   * the effect re-ran, and it cleared the measurements that had just been taken.
   *
   * Nothing looked wrong. The right rows rendered at the right heights; only the scroll height was
   * quietly the estimate times the row count for ever. That is what this asserts: a measured row
   * has to change the total, or the measurement did not survive.
   */
  it('keeps the heights it measures', async () => {
    await setUp({ virtualize: true, maxHeight: '400px' });

    // Alternating heights, so the median the estimate is seeded from cannot also account for the
    // total — only retained per-row measurements can.
    const rendered = bodyRows();
    rendered.forEach((row, i) => {
      vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({
        ...new DOMRect(0, 0, 200, i % 2 === 0 ? 30 : 90),
        height: i % 2 === 0 ? 30 : 90,
        toJSON: () => ({}),
      } as DOMRect);
    });

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    fixture.detectChanges();
    await fixture.whenStable();

    const spacerHeight = Number.parseFloat(spacers().at(-1)!.style.height);
    const estimate = 30;
    const unmeasured = 1000 - bodyRows().length;
    // Had the measurements been wiped, the spacer would be a whole number of estimates.
    expect(spacerHeight).not.toBe(unmeasured * estimate);
    expect(spacerHeight).toBeGreaterThan(0);
  });

  /*
   * Checked rather than assumed: select-all means the page. Had it followed the rendered slice it
   * would have selected the twenty rows on screen while claiming to have selected a thousand.
   */
  it('still selects the whole page, not the window', async () => {
    await setUp({ virtualize: true, maxHeight: '400px', selectionMode: 'multiple' });

    const selectAll = (fixture.nativeElement as HTMLElement).querySelector(
      '.gog-table__th--select input',
    ) as HTMLInputElement;
    selectAll.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.selection().length).toBe(1000);
  });
});
