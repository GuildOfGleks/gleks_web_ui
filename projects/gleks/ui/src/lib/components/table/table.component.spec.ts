import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TableComponent } from './table.component';
import { Column, GogColumn, GogColumnBodyDirective, GogColumnHeaderDirective } from './column';
import { TemplateDirective } from './template.directive';

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
  imports: [TableComponent, Column, TemplateDirective],
  template: `
    <gog-table
      [value]="rows()"
      [pageSize]="pageSize()"
      [loading]="loading()"
      [showRowNumbers]="showRowNumbers()"
      [emptyPlaceholder]="emptyPlaceholder()"
    >
      <column field="id" header="ID" [sortable]="true"></column>
      <column field="name" header="Name" [sortable]="true"></column>
      <ng-template template="id" type="header"><em class="custom-header">ID#</em></ng-template>
      <ng-template template="name" type="body" let-row
        ><strong class="custom-body">{{ $any(row).name }}</strong></ng-template
      >
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
    imports: [TableComponent, Column],
    template: `
      <gog-table [value]="rows">
        <column field="name" [sortable]="true" [comparator]="reverseAlpha"></column>
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
 * The host above deliberately keeps using the deprecated string-keyed
 * `<ng-template template="…" type="…">` form, so the back-compat path stays covered until it is
 * removed in 21.5.0. This host uses the replacement: templates declared inside their own column.
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
