import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ContextMenuComponent,
  GogContextMenuContentDirective,
  GogContextMenuTriggerDirective,
  GogMenuItemDirective,
  IconComponent,
  type GogIconName,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface FileRow {
  name: string;
  icon: GogIconName;
  size: string;
  pinned: boolean;
}

@Component({
  selector: 'app-context-menu-page',
  imports: [
    ContextMenuComponent,
    GogContextMenuContentDirective,
    GogContextMenuTriggerDirective,
    GogMenuItemDirective,
    IconComponent,
    DocAttrs,
    DocPage,
    DocSection,
  ],
  templateUrl: './context-menu-page.html',
  styleUrl: './context-menu-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuPage {
  protected readonly files = signal<FileRow[]>([
    { name: 'report.pdf', icon: 'file-text', size: '1.2 MB', pinned: false },
    { name: 'photos', icon: 'folder', size: '48 items', pinned: true },
    { name: 'budget.xlsx', icon: 'file', size: '86 KB', pinned: false },
  ]);
  protected readonly log = signal<string[]>([]);

  /** The row a right-click landed on, or `null` — between rows the browser's own menu opens. */
  protected readonly fileAt = (target: HTMLElement): FileRow | null => {
    const name = target.closest<HTMLElement>('[data-file]')?.dataset['file'];
    return this.files().find((file) => file.name === name) ?? null;
  };

  protected togglePin(file: FileRow | null): void {
    if (!file) return;
    this.files.update((files) => files.map((f) => (f === file ? { ...f, pinned: !f.pinned } : f)));
    this.record(`${file.pinned ? 'Unpin' : 'Pin'} ${file.name}`);
  }

  protected remove(file: FileRow | null): void {
    if (!file) return;
    this.files.update((files) => files.filter((f) => f !== file));
    this.record(`Delete ${file.name}`);
  }

  protected record(line: string): void {
    this.log.update((lines) => [line, ...lines].slice(0, 4));
  }
}
