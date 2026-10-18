import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  GogButtonDirective,
  GogPopoverTriggerDirective,
  IconComponent,
  InputfieldComponent,
  PopoverComponent,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

@Component({
  selector: 'app-popover-page',
  imports: [
    GogButtonDirective,
    GogPopoverTriggerDirective,
    IconComponent,
    InputfieldComponent,
    PopoverComponent,
    DocAttrs,
    DocPage,
    DocSection,
  ],
  templateUrl: './popover-page.html',
  styleUrl: './popover-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPage {
  protected readonly log = signal<string[]>([]);
  protected readonly note = signal('Leave at the door');

  protected record(line: string): void {
    this.log.update((lines) => [line, ...lines].slice(0, 4));
  }
}
