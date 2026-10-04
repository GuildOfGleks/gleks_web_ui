import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import {
  GOG_CONFIG,
  GogErrorState,
  GogSize,
  resolveConfigured,
  type GogErrorDisplay,
} from '@guildofgleks/ui/shared';

/** Why a file was not added. */
export type GogFileRejectionReason = 'type' | 'size' | 'count';

/** A file `gog-file-upload` refused, and why. */
export interface GogFileRejection {
  file: File;
  reason: GogFileRejectionReason;
}

/**
 * Whether `file` matches an `accept` string in the native syntax: a comma-separated list of
 * extensions (`.pdf`), wildcard types (`image/*`) and exact MIME types (`application/json`). An
 * empty `accept` takes everything. Exported because an app validating a file it got elsewhere
 * wants the same answer the component gives.
 */
export function gogFileMatchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** Built-in defaults, used when `GOG_CONFIG.labels` leaves them unset. */
const DEFAULT_LABELS = {
  fileDrop: 'Drop files here or',
  fileBrowse: 'browse',
  fileRemove: (name: string) => `Remove ${name}`,
  filesAdded: (count: number) => (count === 1 ? '1 file added' : `${count} files added`),
  fileRejected: (name: string, reason: GogFileRejectionReason) =>
    reason === 'type'
      ? `${name} was not added: its type is not accepted`
      : reason === 'size'
        ? `${name} was not added: it is too large`
        : `${name} was not added: too many files`,
};

const UNITS = ['B', 'KB', 'MB', 'GB'];

let nextUid = 0;

/**
 * Choosing files, by the system picker or by a drop. `docs/file-upload.md` has the argument for why
 * it is a component; the short version is that `accept` is only a hint to the picker and a dropped
 * file is never checked against it, so the component validates every file — type, size, count —
 * the same way whichever way it arrived.
 *
 * **The input is the control.** The real `<input type="file">` lies over the whole zone, so it is
 * what takes focus, carries the label and opens with Enter or Space; the zone draws around it and
 * handles the drop.
 *
 * **It does not upload.** It holds `File` objects in `value` (and a form control); sending them is
 * the app's.
 */
@Component({
  selector: 'gog-file-upload',
  imports: [IconComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class FileUploadComponent implements ControlValueAccessor, DoCheck {
  /** The chosen files, two-way. Also what an attached form control holds. */
  readonly value = model<File[]>([]);
  /** Off: a new file replaces the one there. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** The native syntax (`.pdf,image/*`), enforced on every file rather than only offered to the picker. */
  readonly accept = input('');
  /** Bytes, per file. Unset, any size. */
  readonly maxSize = input<number | null>(null);
  /** The most files held at once, counting those already chosen. Unset, no limit. */
  readonly maxFiles = input<number | null>(null);
  readonly label = input('');
  /** A line under the prompt, for what is accepted ("PDF or images, up to 5 MB"). */
  readonly hint = input('');
  /** Names the input when there is no `label`. */
  readonly ariaLabel = input('');
  readonly errorMessage = input('');
  /** Unset, `GOG_CONFIG.control.errorDisplay`, then `'manual'`. */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<GogSize>('md');

  /** Every file refused by one pick or drop, with the reason. */
  readonly gogReject = output<GogFileRejection[]>();

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly inputId = `gog-file-upload-${nextUid++}`;
  protected readonly hintId = `${this.inputId}-hint`;
  protected readonly errorId = `${this.inputId}-error`;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly dragging = signal(false);
  /** dragenter and dragleave fire for every child crossed; only the outermost pair counts. */
  private dragDepth = 0;
  protected readonly announcement = signal('');

  private onChange: (value: File[]) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  private readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(this.errorDisplay(), this.globalConfig.control?.errorDisplay, 'manual'),
  );
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  protected readonly describedBy = computed(
    () =>
      [this.hint() ? this.hintId : null, this.hasError() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );

  protected readonly resolvedLabels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      drop: resolveConfigured(undefined, configured.fileDrop, DEFAULT_LABELS.fileDrop),
      browse: resolveConfigured(undefined, configured.fileBrowse, DEFAULT_LABELS.fileBrowse),
      remove: configured.fileRemove ?? DEFAULT_LABELS.fileRemove,
      added: configured.filesAdded ?? DEFAULT_LABELS.filesAdded,
      rejected: configured.fileRejected ?? DEFAULT_LABELS.fileRejected,
    };
  });

  protected readonly hostClasses = computed(
    () => `gog-file-upload-host gog-file-upload--${this.size()}`,
  );

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(value: File[] | null): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    // Cleared so picking the same file again — after removing it — still fires `change`.
    input.value = '';
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.isDisabled() || !this.carriesFiles(event)) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || !this.carriesFiles(event)) return;
    // Without this the browser refuses the drop, or opens the file in the tab.
    event.preventDefault();
  }

  protected onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    // Prevented even when disabled: the alternative is the browser navigating to the file.
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    if (this.isDisabled()) return;
    this.add(Array.from(event.dataTransfer?.files ?? []));
    this.onTouched();
  }

  protected remove(index: number): void {
    const next = this.value().filter((_, i) => i !== index);
    this.commit(next);
    // The pressed button is gone; focus the remove button that took its place, or the input.
    afterNextRender(
      () => {
        const buttons = this.elementRef.nativeElement.querySelectorAll<HTMLButtonElement>(
          '.gog-file-upload__remove',
        );
        (buttons[Math.min(index, buttons.length - 1)] ?? this.input().nativeElement).focus();
      },
      { injector: this.injector },
    );
  }

  protected formatSize(bytes: number): string {
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < UNITS.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${unit === 0 ? size : size.toFixed(1)} ${UNITS[unit]}`;
  }

  /** Validates and adds files from either source, and says what happened. */
  private add(files: File[]): void {
    if (files.length === 0) return;
    const accepted: File[] = [];
    const rejected: GogFileRejection[] = [];
    const maxSize = this.maxSize();
    for (const file of files) {
      if (!gogFileMatchesAccept(file, this.accept())) rejected.push({ file, reason: 'type' });
      else if (maxSize !== null && file.size > maxSize) rejected.push({ file, reason: 'size' });
      else accepted.push(file);
    }

    // Without `multiple` the field holds one file: the first valid one replaces what is there.
    let next = this.multiple() ? [...this.value(), ...accepted] : accepted.slice(0, 1);
    if (!this.multiple()) {
      for (const file of accepted.slice(1)) rejected.push({ file, reason: 'count' });
    }
    const maxFiles = this.maxFiles();
    if (maxFiles !== null && next.length > maxFiles) {
      for (const file of next.slice(maxFiles)) rejected.push({ file, reason: 'count' });
      next = next.slice(0, maxFiles);
    }

    const added = next.filter((file) => !this.value().includes(file)).length;
    if (added > 0) this.commit(next);
    if (rejected.length) this.gogReject.emit(rejected);

    const labels = this.resolvedLabels();
    this.announcement.set(
      [
        added > 0 ? labels.added(added) : null,
        ...rejected.map(({ file, reason }) => labels.rejected(file.name, reason)),
      ]
        .filter(Boolean)
        .join('. '),
    );
  }

  private commit(next: File[]): void {
    this.value.set(next);
    this.onChange(next);
  }

  private carriesFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }
}
