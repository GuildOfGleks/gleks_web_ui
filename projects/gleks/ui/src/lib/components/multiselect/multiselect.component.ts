import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  PLATFORM_ID,
  Signal,
  computed,
  inject,
  input,
  model,
  TemplateRef,
  signal,
  createComponent,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../icon/icon.component';
import { resolveDropdownPlacement, type GogDropdownDirection } from '../../shared/dropdown-position';
import { handleRovingFocusKeydown } from '../../shared/roving-focus';
import { GogSize } from '../../shared/types';

export interface GogMultiselectOption {
  id: string | number;
  name: string;
  disabled?: boolean;
}

@Component({
  selector: 'gog-multiselect-dropdown-portal',
  imports: [ButtonComponent],
  template: `
    <div
      [id]="listboxId"
      class="gog-ms__dropdown gog-ms__dropdown--portal"
      [class.gog-ms__dropdown--sm]="size === 'sm'"
      [class.gog-ms__dropdown--lg]="size === 'lg'"
      [style.top.px]="top"
      [style.left.px]="left"
      [style.width.px]="width"
      [style.max-height.px]="maxHeight"
      [style.z-index]="zIndex"
      role="listbox"
      aria-multiselectable="true"
    >
      @if (showControls) {
        <div class="gog-ms__controls">
          <gog-button variant="ghost" size="sm" (click)="onSelectAll($event)">Select all</gog-button>
          <gog-button variant="ghost" size="sm" (click)="onClearAll($event)">Clear</gog-button>
        </div>
      }
      <div class="gog-ms__options">
        @for (option of options; track option.id) {
          <button
            type="button"
            class="gog-ms__option font-body"
            role="option"
            [attr.aria-selected]="isSelected(option.id)"
            [attr.aria-disabled]="option.disabled ?? false"
            [class.gog-ms__option--selected]="isSelected(option.id)"
            [class.gog-ms__option--disabled]="option.disabled ?? false"
            (click)="onToggle(option, $event)"
            (keydown)="onOptionKeydown($event)"
          >
          <span class="gog-ms__option-mark" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true">
              <rect
                x="2.5"
                y="2.5"
                width="11"
                height="11"
                rx="2"
                [attr.fill]="isSelected(option.id) ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.5"
              />
              @if (isSelected(option.id)) {
                <path
                  d="M4 8L6.75 10.75L12 5.5"
                  stroke="var(--gog-ms-checkbox-checked-color)"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              }
            </svg>
          </span>
            {{ option.name }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GogMultiselectDropdownPortal {
  top = 0;
  left = 0;
  width = 200;
  maxHeight = 260;
  zIndex = 9999;
  listboxId = '';
  direction: 'up' | 'down' = 'down';
  size: GogSize = 'md';
  options: GogMultiselectOption[] = [];
  selectedIds: (string | number)[] = [];
  showControls = false;
  onToggle: (o: GogMultiselectOption, e: MouseEvent) => void = () => {};
  onSelectAll: (e: MouseEvent) => void = () => {};
  onClearAll: (e: MouseEvent) => void = () => {};
  onOptionKeydown: (event: KeyboardEvent) => void = () => {};

  isSelected(id: string | number): boolean {
    return this.selectedIds.includes(id);
  }
}

@Component({
  selector: 'gog-multiselect',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './multiselect.component.html',
  styleUrl: './multiselect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(window:scroll)': 'onScrollOrResize()',
    '(window:resize)': 'onScrollOrResize()',
  },
})
export class MultiselectComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly instanceId = ++MultiselectComponent.nextId;
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Select...');
  readonly options = input<GogMultiselectOption[]>([]);
  readonly errorMessage = input('');
  readonly size = input<GogSize>('md');
  readonly showControls = input(false);
  readonly dropdownDirection = input<GogDropdownDirection>('auto');
  readonly dropdownZIndex = input<number | null>(null);
  readonly appendToBody = input(false);
  readonly disabled = input(false);
  readonly chevronTemplate = input<TemplateRef<unknown> | null>(null);
  readonly clearIconTemplate = input<TemplateRef<unknown> | null>(null);

  /** Two-way bindable selected ids: `[(value)]="signal"`. */
  readonly value = model<(string | number)[]>([]);
  readonly isOpen = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly dropdownDirectionState = signal<'up' | 'down'>('down');

  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly _touched = signal(false);
  private readonly formStatus: Signal<string> = this.ngControl?.statusChanges
    ? toSignal(this.ngControl.statusChanges, { initialValue: this.ngControl.status ?? 'VALID' })
    : signal('VALID');

  protected readonly hasError = computed(() => {
    if (this.ngControl) {
      return this._touched() && this.formStatus() === 'INVALID';
    }
    // Consumer-controlled: shown for as long as `errorMessage` is non-empty. The
    // consumer decides when to clear it, rather than the field silently hiding it
    // once something is selected.
    return !!this.errorMessage();
  });

  protected readonly visibleError = computed(() => (this.hasError() ? this.errorMessage() : ''));

  private portalHost: HTMLElement | null = null;
  private portalRef: ReturnType<typeof createComponent<GogMultiselectDropdownPortal>> | null = null;

  readonly selectedNames = computed(() =>
    this.value()
      .map((id) => this.options().find((o) => o.id === id)?.name)
      .filter(Boolean)
      .join(', '),
  );

  private _onChange: (val: (string | number)[]) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.destroyRef.onDestroy(() => this.destroyPortal());
  }

  onDocumentClick(e: MouseEvent): void {
    const inside =
      this.elRef.nativeElement.contains(e.target as Node) ||
      (this.portalHost?.contains(e.target as Node) ?? false);
    if (!inside) {
      this.isOpen.set(false);
      if (this.appendToBody()) this.destroyPortal();
    }
  }

  onScrollOrResize(): void {
    if (!this.isOpen()) return;
    if (this.appendToBody()) {
      this.updatePortalPosition();
      return;
    }
    this.updateInlineDirection();
  }

  writeValue(val: (string | number)[] | null): void {
    this.value.set(val ?? []);
  }
  registerOnChange(fn: (val: (string | number)[]) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected isSelected(id: string | number): boolean {
    return this.value().includes(id);
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (this.appendToBody()) {
      if (next) this.openPortal();
      else this.destroyPortal();
    } else if (next) {
      this.updateInlineDirection();
    }
  }

  protected toggleOption(option: GogMultiselectOption, e: MouseEvent): void {
    e.stopPropagation();
    if (option.disabled) return;
    this.applyToggle(option.id);
    if (this.appendToBody() && this.portalRef) {
      this.portalRef.instance.selectedIds = [...this.value()];
      this.portalRef.changeDetectorRef.detectChanges();
    }
  }

  private applyToggle(id: string | number): void {
    const current = this.value();
    const next = this.isSelected(id) ? current.filter((x) => x !== id) : [...current, id];
    this.value.set(next);
    this._onChange(next);
    this._onTouched();
    this._touched.set(true);
  }

  protected selectAll(e: MouseEvent): void {
    e.stopPropagation();
    const all = this.options()
      .filter((o) => !o.disabled)
      .map((o) => o.id);
    this.value.set(all);
    this._onChange(all);
    this._onTouched();
    this._touched.set(true);
    if (this.appendToBody() && this.portalRef) {
      this.portalRef.instance.selectedIds = [...all];
      this.portalRef.changeDetectorRef.detectChanges();
    }
  }

  protected clearAll(e: MouseEvent): void {
    e.stopPropagation();
    this.value.set([]);
    this._onChange([]);
    this._onTouched();
    this._touched.set(true);
    if (this.appendToBody() && this.portalRef) {
      this.portalRef.instance.selectedIds = [];
      this.portalRef.changeDetectorRef.detectChanges();
    }
  }

  protected clearTrigger(e: Event): void {
    e.stopPropagation();
    this.value.set([]);
    this._onChange([]);
    this._onTouched();
    this._touched.set(true);
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    if (this.appendToBody()) this.destroyPortal();
  }

  /** Jumps from the trigger into the option list on ArrowDown/ArrowUp while the dropdown is open. */
  protected onTriggerArrowKeydown(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();

    const options = this.enabledOptionElements();
    if (options.length === 0) return;

    const index = (event as KeyboardEvent).key === 'ArrowUp' ? options.length - 1 : 0;
    options[index]?.focus();
  }

  protected onOptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      this.focusTrigger();
      return;
    }

    handleRovingFocusKeydown(event, this.enabledOptionElements());
  }

  private enabledOptionElements(): HTMLButtonElement[] {
    const scope = this.appendToBody() && this.portalHost ? this.portalHost : (this.elRef.nativeElement as HTMLElement);
    return Array.from(
      scope.querySelectorAll<HTMLButtonElement>('.gog-ms__option:not([aria-disabled="true"])'),
    );
  }

  private focusTrigger(): void {
    (this.elRef.nativeElement as HTMLElement).querySelector<HTMLElement>('.gog-ms')?.focus();
  }

  private estimatePanelHeight(): number {
    const controlsHeight = this.showControls() ? 38 : 0;
    const optionsCount = Math.max(this.options().length, 1);
    const optionsPadding = this.getOptionPadding() * 2;
    const optionGap = this.getOptionGap();
    const optionsHeight = optionsCount * 40 + Math.max(optionsCount - 1, 0) * optionGap + optionsPadding;
    return Math.min(optionsHeight + controlsHeight, 260);
  }

  private getOptionGap(): number {
    if (!this.isBrowser) {
      return 4;
    }

    const gap = getComputedStyle(this.elRef.nativeElement).getPropertyValue('--gog-ms-option-gap').trim();
    const parsedGap = Number.parseFloat(gap);
    return Number.isFinite(parsedGap) ? parsedGap : 4;
  }

  private getOptionPadding(): number {
    if (!this.isBrowser) {
      return 4;
    }

    const padding = getComputedStyle(this.elRef.nativeElement)
      .getPropertyValue('--gog-ms-options-padding')
      .trim();
    const parsedPadding = Number.parseFloat(padding);
    return Number.isFinite(parsedPadding) ? parsedPadding : 4;
  }

  private updateInlineDirection(): void {
    if (!this.isBrowser) return;

    const placement = resolveDropdownPlacement(
      this.dropdownDirection(),
      this.elRef.nativeElement.getBoundingClientRect(),
      this.estimatePanelHeight(),
      window.innerHeight,
      2,
      8,
    );

    this.dropdownDirectionState.set(placement.direction);
  }

  private openPortal(): void {
    if (!this.isBrowser) return;
    this.destroyPortal();

    this.portalHost = document.createElement('div');
    document.body.appendChild(this.portalHost);

    this.portalRef = createComponent(GogMultiselectDropdownPortal, {
      environmentInjector: this.envInjector,
      hostElement: this.portalHost,
    });

    const inst = this.portalRef.instance;
    inst.options = this.options();
    inst.selectedIds = [...this.value()];
    inst.showControls = this.showControls();
    inst.listboxId = `gog-ms-listbox-${this.instanceId}`;
    inst.zIndex = this.dropdownZIndex() ?? 9999;
    inst.direction = this.dropdownDirectionState();
    inst.maxHeight = this.estimatePanelHeight();
    inst.size = this.size();
    inst.onToggle = (o, e) => this.toggleOption(o, e);
    inst.onSelectAll = (e) => this.selectAll(e);
    inst.onClearAll = (e) => this.clearAll(e);
    inst.onOptionKeydown = (event) => this.onOptionKeydown(event);

    this.updatePortalPosition();
    this.appRef.attachView(this.portalRef.hostView);
    this.portalRef.changeDetectorRef.detectChanges();
  }

  private updatePortalPosition(): void {
    if (!this.portalRef || !this.isBrowser) return;

    const placement = resolveDropdownPlacement(
      this.dropdownDirection(),
      this.elRef.nativeElement.getBoundingClientRect(),
      this.estimatePanelHeight(),
      window.innerHeight,
      2,
      8,
    );

    this.portalRef.instance.direction = placement.direction;
    this.portalRef.instance.top = placement.top;
    this.portalRef.instance.left = placement.left;
    this.portalRef.instance.width = placement.width;
    this.portalRef.instance.maxHeight = placement.maxHeight;
    this.dropdownDirectionState.set(placement.direction);
    this.portalRef.changeDetectorRef.detectChanges();
  }

  private destroyPortal(): void {
    if (this.portalRef) {
      this.appRef.detachView(this.portalRef.hostView);
      this.portalRef.destroy();
      this.portalRef = null;
    }
    if (this.portalHost) {
      this.portalHost.remove();
      this.portalHost = null;
    }
  }
}
