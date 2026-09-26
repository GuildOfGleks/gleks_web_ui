import {
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  TableComponent,
} from '@guildofgleks/ui/table';

import type { DocApi } from '../../doc/doc-api';

export const TABLE_API: readonly DocApi[] = [
  {
    type: TableComponent,
    inputs: [
      { name: 'value', type: 'T[]', default: '[]' },
      { name: 'fullWidth', type: 'boolean', default: 'true' },
      { name: 'pageSize', type: 'number (model)', default: '0' },
      {
        name: 'showPageSizeSelect',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.paginator.showPageSizeSelect',
      },
      {
        name: 'pageSizeOptions',
        type: 'number[] | undefined',
        default: '[10, 20, 30, 40, 50]',
        config: 'GOG_CONFIG.paginator.pageSizeOptions',
      },
      { name: 'lazy', type: 'boolean', default: 'false' },
      { name: 'totalRecords', type: 'number | null', default: 'null' },
      { name: 'interactiveRows', type: 'boolean', default: 'false' },
      { name: 'selectionMode', type: 'GogTableSelectionMode', default: "'none'" },
      { name: 'selection', type: 'T[] (model)', default: '[]' },
      { name: 'dataKey', type: 'string', default: "''" },
      { name: 'showSelectionColumn', type: 'boolean', default: 'true' },
      { name: 'selectOnRowClick', type: 'boolean', default: 'false' },
      { name: 'showRowNumbers', type: 'boolean', default: 'true' },
      { name: 'showTotal', type: 'boolean', default: 'false' },
      { name: 'emptyPlaceholder', type: 'string', default: "'-'" },
      { name: 'paginatorPosition', type: "'left' | 'center' | 'right'", default: "'center'" },
      { name: 'totalPosition', type: "'left' | 'right' | 'opposite'", default: "'opposite'" },
      { name: 'loading', type: 'boolean', default: 'false' },
      { name: 'showColumnBorders', type: 'boolean', default: 'false' },
      { name: 'stickyHeader', type: 'boolean', default: 'false' },
      { name: 'maxHeight', type: 'string | null', default: 'null' },
      { name: 'size', type: 'GogSize', default: "'lg'" },
      { name: 'virtualize', type: 'boolean', default: 'false' },
    ],
    outputs: [
      { name: 'pageSizeChange', payload: 'number' },
      { name: 'selectionChange', payload: 'T[]' },
      { name: 'gogSortChange', payload: 'GogTableSortEvent' },
      { name: 'gogPageChange', payload: 'number' },
      { name: 'gogRowClick', payload: 'GogTableRowClickEvent<T>' },
    ],
  },
  {
    type: GogColumn,
    inputs: [
      { name: 'field', type: 'string (required)', default: '—' },
      { name: 'header', type: 'string', default: "''" },
      { name: 'sortable', type: 'boolean', default: 'false' },
      { name: 'width', type: 'string', default: "''" },
      { name: 'minWidth', type: 'string', default: "''" },
      { name: 'maxWidth', type: 'string', default: "''" },
      {
        name: 'comparator',
        type: '((a: unknown, b: unknown) => number) | null',
        default: 'null',
      },
    ],
    outputs: [],
  },
  { type: GogColumnHeaderDirective, inputs: [], outputs: [] },
  { type: GogColumnBodyDirective, inputs: [], outputs: [] },
];
