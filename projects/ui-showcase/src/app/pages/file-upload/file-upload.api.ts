import { FileUploadComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const FILE_UPLOAD_API: readonly DocApi[] = [
  {
    type: FileUploadComponent,
    inputs: [
      { name: 'value', type: 'File[] (model)', default: '[]' },
      { name: 'multiple', type: 'boolean', default: 'false' },
      { name: 'accept', type: 'string', default: "'' (anything)" },
      { name: 'maxSize', type: 'number | null', default: 'null (bytes; no limit)' },
      { name: 'maxFiles', type: 'number | null', default: 'null (no limit)' },
      { name: 'label', type: 'string', default: "''" },
      { name: 'hint', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'errorMessage', type: 'string', default: "''" },
      {
        name: 'errorDisplay',
        type: 'GogErrorDisplay | undefined',
        default: "'manual'",
        config: 'GOG_CONFIG.control.errorDisplay',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'size', type: 'GogSize', default: "'md'" },
    ],
    outputs: [
      { name: 'valueChange', payload: 'File[]' },
      { name: 'gogReject', payload: 'GogFileRejection[]' },
    ],
  },
];
