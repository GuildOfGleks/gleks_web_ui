import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { FILE_UPLOAD_EXAMPLES } from '../../../examples/file-upload/sources.generated';
import { FileUploadOverviewExample } from '../../../examples/file-upload/file-upload-overview/example';
import { FileUploadSizesExample } from '../../../examples/file-upload/file-upload-sizes/example';
import { FileUploadStatesExample } from '../../../examples/file-upload/file-upload-states/example';
import { FileUploadFormsExample } from '../../../examples/file-upload/file-upload-forms/example';
import { FileUploadValidationExample } from '../../../examples/file-upload/file-upload-validation/example';
import { FileUploadSingleExample } from '../../../examples/file-upload/file-upload-single/example';

const FILE_UPLOAD_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'File[] (model)',
    default: '[]',
    description: 'The chosen files, two-way. Also what an attached form control holds.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Off: a new file replaces the one there.',
  },
  {
    name: 'accept',
    type: 'string',
    default: "''",
    description:
      'The native syntax (.pdf, image/*, application/json), enforced on every file, picked or dropped.',
  },
  {
    name: 'maxSize',
    type: 'number | null',
    default: 'null',
    description: 'Bytes, per file. Unset, any size.',
  },
  {
    name: 'maxFiles',
    type: 'number | null',
    default: 'null',
    description: 'The most files held at once, counting those already chosen.',
  },
  {
    name: 'label',
    type: 'string',
    default: "''",
    description: 'The input’s name.',
  },
  {
    name: 'hint',
    type: 'string',
    default: "''",
    description: 'A line in the zone describing what is accepted; also the input’s description.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Names the input when there is no label.',
  },
  {
    name: 'errorMessage',
    type: 'string',
    default: "''",
    description: 'The error line, and the zone’s danger border.',
  },
  {
    name: 'errorDisplay',
    type: 'GogErrorDisplay | undefined',
    default: "'manual'",
    description: 'When the error shows. Unset, GOG_CONFIG.control.errorDisplay.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: '',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'.",
  },
];

const FILE_UPLOAD_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'File[]',
    description: 'The value, after a pick, a drop or a removal.',
  },
  {
    name: 'gogReject',
    type: 'GogFileRejection[]',
    description:
      "Every file one pick or drop refused, as { file, reason: 'type' | 'size' | 'count' }.",
  },
];

@Component({
  selector: 'app-file-upload-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './file-upload-doc-page.html',
  styleUrl: './file-upload-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadDocPage {
  protected readonly fileUploadInputs = FILE_UPLOAD_INPUTS;
  protected readonly fileUploadOutputs = FILE_UPLOAD_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'file-upload')?.tokens ?? [];

  protected readonly sources = FILE_UPLOAD_EXAMPLES;
  protected readonly examples = {
    overview: FileUploadOverviewExample,
    sizes: FileUploadSizesExample,
    states: FileUploadStatesExample,
    forms: FileUploadFormsExample,
    validation: FileUploadValidationExample,
    single: FileUploadSingleExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { FileUploadComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [FileUploadComponent],',
    '})',
    '```',
  ].join('\n');
}
