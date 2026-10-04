import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent, type GogFileRejection, type GogSize } from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

@Component({
  selector: 'app-file-upload-page',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    FileUploadComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './file-upload-page.html',
  styleUrl: './file-upload-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadPage {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly column = ['field'] as const;

  protected readonly states: readonly Labelled<{ disabled: boolean; error: string }>[] = [
    { name: 'default', value: { disabled: false, error: '' } },
    { name: 'errorMessage', value: { disabled: false, error: 'Attach the signed contract' } },
    { name: 'disabled', value: { disabled: true, error: '' } },
  ];

  protected readonly files = signal<File[]>([]);
  protected readonly rejections = signal<GogFileRejection[]>([]);
  protected readonly rejectionSummary = computed(() =>
    this.rejections().map(({ file, reason }) => `${file.name}: ${reason}`),
  );

  protected readonly control = new FormControl<File[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  protected controlNames(): string[] {
    return this.control.value.map((file) => file.name);
  }
}
