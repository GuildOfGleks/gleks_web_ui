import { PaginatorComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const PAGINATOR_API: readonly DocApi[] = [
  {
    type: PaginatorComponent,
    inputs: [
      { name: 'page', type: 'number (model)', default: '1' },
      { name: 'fullWidth', type: 'boolean', default: 'true' },
      { name: 'totalPages', type: 'number', default: '1' },
      { name: 'totalRecords', type: 'number | null', default: 'null' },
      { name: 'pageSize', type: 'number (model)', default: '10' },
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
      { name: 'rangeMode', type: 'GogPaginatorRangeMode', default: "'window'" },
      { name: 'visiblePages', type: 'number', default: '5' },
      { name: 'showFirstPage', type: 'boolean', default: 'false' },
      { name: 'showLastPage', type: 'boolean', default: 'false' },
      { name: 'siblingCount', type: 'number', default: '2' },
      { name: 'size', type: 'GogSize', default: "'sm'" },
      { name: 'disabled', type: 'boolean', default: 'false' },
      {
        name: 'ariaLabel',
        type: 'string | undefined',
        default: "'Pagination'",
        config: 'GOG_CONFIG.labels.pagination',
      },
    ],
    outputs: [
      { name: 'pageChange', payload: 'number' },
      { name: 'pageSizeChange', payload: 'number' },
    ],
  },
];
