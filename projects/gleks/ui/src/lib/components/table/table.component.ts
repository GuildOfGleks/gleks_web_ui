import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { SpinnerComponent } from '../spinner/spinner.component';

import { GogSize } from '../../shared/types';
import { Column } from './column';
import { TemplateDirective } from './template.directive';

export type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: string;
  direction: SortDirection;
}

@Component({
  selector: 'gog-table',
  imports: [SpinnerComponent, PaginatorComponent, NgTemplateOutlet, IconComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-table-host',
    '[style.display]': '"block"',
    '[style.width]': '"100%"',
  },
})
export class TableComponent<T extends object> {
  readonly value = input<T[]>([]);
  /** 0 = no pagination */
  readonly pageSize = input<number>(0);
  readonly showRowNumbers = input<boolean>(true);
  readonly showTotal = input<boolean>(false);
  readonly emptyPlaceholder = input<string>('-');
  /** Alignment of pagination controls */
  readonly paginatorPosition = input<'left' | 'center' | 'right'>('center');
  /** Alignment of total count label (only when showTotal=true) */
  readonly totalPosition = input<'left' | 'right' | 'opposite'>('opposite');
  /** Show loading spinner instead of rows */
  readonly loading = input<boolean>(false);
  /** Show vertical borders between columns */
  readonly showColumnBorders = input<boolean>(false);
  /** Stick header row to the top of the viewport while scrolling */
  readonly stickyHeader = input<boolean>(false);
  /** Row density: lg (default) / md (compact) / sm (dense) */
  readonly size = input<GogSize>('lg');

  readonly columns = contentChildren(Column);
  readonly templates = contentChildren(TemplateDirective);

  readonly currentPage = signal(1);
  readonly sortState = signal<SortState>({ field: '', direction: null });

  constructor() {
    effect(() => {
      this.value();
      this.pageSize();
      this.currentPage();
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    });
  }

  readonly sortedData = computed(() => {
    const { field, direction } = this.sortState();
    const rows = [...this.value()];
    if (!field || !direction) return rows;
    return rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[field];
      const bv = (b as Record<string, unknown>)[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.sortedData().length / size));
  });

  readonly visibleRows = computed(() => {
    const size = this.pageSize();
    if (!size) return this.sortedData();
    const page = this.currentPage();
    const start = (page - 1) * size;
    return this.sortedData().slice(start, start + size);
  });

  readonly hasPagination = computed(
    () => !this.loading() && this.pageSize() > 0 && this.totalPages() > 1,
  );

  readonly emptyColspan = computed(() => this.columns().length + (this.showRowNumbers() ? 1 : 0));

  getBodyTemplate(field: string): TemplateRef<unknown> | null {
    return this.bodyTemplateMap().get(field) ?? null;
  }

  getHeaderTemplate(field: string): TemplateRef<unknown> | null {
    return this.headerTemplateMap().get(field) ?? null;
  }

  toggleSort(col: Column<T>): void {
    if (!col.sortable()) return;
    const cur = this.sortState();
    const field = col.field();
    if (cur.field !== field) {
      this.sortState.set({ field, direction: 'asc' });
    } else if (cur.direction === 'asc') {
      this.sortState.set({ field, direction: 'desc' });
    } else {
      this.sortState.set({ field: '', direction: null });
    }
    this.currentPage.set(1);
  }

  getSortDirection(field: string): SortDirection {
    const s = this.sortState();
    return s.field === field ? s.direction : null;
  }

  getAriaSort(field: string): 'ascending' | 'descending' | null {
    const direction = this.getSortDirection(field);
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return null;
  }

  handleSortClick(col: Column<T>): void {
    if (!this.loading()) this.toggleSort(col);
  }

  getCellValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  formatCellValue(row: T, field: string): string {
    const value = this.getCellValue(row, field);
    return value == null ? this.emptyPlaceholder() : String(value);
  }

  globalRowIndex(localIndex: number): number {
    const size = this.pageSize();
    if (!size) return localIndex + 1;
    return (this.currentPage() - 1) * size + localIndex + 1;
  }

  /** CSS grid-area for the total label: left slot or right slot */
  readonly totalGridArea = computed(() => {
    const totalPos = this.totalPosition();
    const paginatorPos = this.paginatorPosition();
    if (totalPos === 'opposite') return paginatorPos === 'right' ? 'left' : 'right';
    return totalPos;
  });

  /** CSS grid-area for the pagination block */
  readonly paginatorGridArea = computed(() => this.paginatorPosition());

  private readonly bodyTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const t of this.templates()) {
      if (t.type() === 'body') map.set(t.template(), t.templateRef);
    }
    return map;
  });

  private readonly headerTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const t of this.templates()) {
      if (t.type() === 'header') map.set(t.template(), t.templateRef);
    }
    return map;
  });
}
