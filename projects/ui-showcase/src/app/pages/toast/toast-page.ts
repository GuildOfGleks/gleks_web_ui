import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  inject,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import {
  GogButtonDirective,
  IconComponent,
  type Toast,
  ToastComponent,
  type ToastPosition,
  ToastService,
  type ToastType,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TOAST_CONFIG_ROWS } from './toast.api';

interface Shape {
  readonly name: string;
  readonly isFront: boolean;
  readonly toast: Omit<Toast, 'id' | 'type' | 'iconName' | 'position' | 'dedupeKey' | 'revision'>;
}

const NO_ACTION = (): void => undefined;

@Component({
  selector: 'app-toast-page',
  imports: [
    GogButtonDirective,
    IconComponent,
    ToastComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './toast-page.html',
  styleUrl: './toast-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPage {
  private readonly toasts = inject(ToastService);
  private readonly starTemplate = viewChild.required<TemplateRef<unknown>>('star');

  protected readonly configRows = TOAST_CONFIG_ROWS;
  protected readonly types: readonly ToastType[] = ['success', 'error', 'warning', 'info'];
  protected readonly positions: readonly ToastPosition[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  protected readonly shapes: readonly Shape[] = [
    {
      name: 'isSticky: true',
      isFront: true,
      toast: { message: 'Report exported.', actions: [], isSticky: true, duration: 4000 },
    },
    {
      name: 'actions: [Undo, View]',
      isFront: true,
      toast: {
        message: 'Report exported.',
        actions: [
          { label: 'Undo', onClick: NO_ACTION },
          { label: 'View', iconName: 'external-link', onClick: NO_ACTION },
        ],
        isSticky: true,
        duration: 4000,
      },
    },
    {
      name: 'timed, [isFront]="false"',
      isFront: false,
      toast: { message: 'Report exported.', actions: [], isSticky: false, duration: 4000 },
    },
  ];

  /**
   * One `Toast` per matrix cell, built once: a new object on every change detection would restart
   * the component's timer effect each time.
   */
  protected readonly cells: Readonly<Record<string, Toast>> = Object.fromEntries(
    this.shapes.flatMap((shape) =>
      this.types.map((type) => [`${shape.name}|${type}`, this.cellToast(shape, type)]),
    ),
  );

  protected readonly long = this.cellToast(
    {
      name: 'long',
      isFront: true,
      toast: {
        message:
          'The export finished, but 14 rows referenced a cost centre that no longer exists and were written with an empty value. Open the report to review them.',
        actions: [{ label: 'Open report', onClick: NO_ACTION }],
        isSticky: true,
        duration: 4000,
      },
    },
    'warning',
  );

  protected readonly icons: readonly Toast[] = [
    {
      ...this.cellToast(this.shapes[0], 'info'),
      iconName: 'download',
      message: "iconName: 'download'",
    },
    {
      ...this.cellToast(this.shapes[0], 'success'),
      iconName: 'rocket',
      message: "iconName: 'rocket' (registered)",
    },
  ];

  /** The matrix is remounted from this, so a toast closed in a cell can be brought back. */
  protected readonly generation = signal(0);

  protected readonly lastEvent = signal('none yet');
  private dedupeCount = 0;

  /** What the container's two live regions hold right now, read from the DOM. */
  protected readonly regions = signal('…');

  constructor() {
    const document = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const container = document.querySelector('gog-toast-container');
      if (!container) {
        this.regions.set('no gog-toast-container in the document');
        return;
      }
      const read = () =>
        this.regions.set(
          Array.from(container.querySelectorAll('[aria-live]'))
            .map((region) => {
              const lines = Array.from(region.children).map((line) => line.textContent?.trim());
              return `aria-live="${region.getAttribute('aria-live')}" aria-atomic="${region.getAttribute('aria-atomic')}": ${lines.length ? lines.map((line) => `"${line}"`).join(', ') : '(empty)'}`;
            })
            .join('\n'),
        );
      read();
      const observer = new MutationObserver(read);
      observer.observe(container, { subtree: true, childList: true, characterData: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected cell(shape: Shape, type: ToastType): Toast {
    return this.cells[`${shape.name}|${type}`];
  }

  protected oneOfEach(): void {
    this.toasts.success('Saved.');
    this.toasts.info('Sync starts in a minute.');
    this.toasts.warning('Storage is 90% full.');
    this.toasts.error('Upload failed.');
  }

  protected at(position: ToastPosition): void {
    this.toasts.info(`position: '${position}'`, { position });
  }

  protected burst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toasts.info(`Queued ${index} of 7`, { position: 'top-right' });
    }
  }

  protected timed(duration: number): void {
    this.toasts.info(`duration: ${duration}`, { duration });
  }

  protected sticky(): void {
    this.toasts.warning('isSticky: true — stays until closed.', { isSticky: true });
  }

  protected withUndo(): void {
    const id = this.toasts.success('Moved 3 files to Archive.', {
      actions: [
        {
          label: 'Undo',
          onClick: (toast) => {
            this.toasts.dismiss(toast.id);
            this.lastEvent.set(`Undo pressed on ${toast.id.slice(0, 8)}…`);
          },
        },
      ],
    });
    this.lastEvent.set(`show() returned ${id.slice(0, 8)}…`);
  }

  protected deduped(): void {
    this.dedupeCount += 1;
    this.toasts.info(`Saving draft… (${this.dedupeCount})`, { dedupeKey: 'draft' });
  }

  protected template(): void {
    this.toasts.show({ message: 'iconTemplate', iconTemplate: this.starTemplate() });
  }

  protected dismissAll(): void {
    this.toasts.dismissAll();
  }

  protected onDismissed(id: string): void {
    this.lastEvent.set(`dismissed emitted ${id}`);
  }

  private cellToast(shape: Shape, type: ToastType): Toast {
    return {
      ...shape.toast,
      id: `${shape.name}-${type}`,
      type,
      // What `ToastService` picks for a type: each type has a glyph of its own name.
      iconName: type,
      position: 'bottom-right',
      dedupeKey: '',
      revision: 0,
    };
  }
}
