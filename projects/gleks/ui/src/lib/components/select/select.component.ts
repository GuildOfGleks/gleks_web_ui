import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  PLATFORM_ID,
  TemplateRef,
  computed,
  createComponent,
  inject,
  input,
  model,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { resolveDropdownPlacement, type GogDropdownDirection } from '../../shared/dropdown-position';
import { handleRovingFocusKeydown } from '../../shared/roving-focus';
import { GogSize } from '../../shared/types';

export interface GogSelectOption {
  id: string | number;
  name: string;
  disabled?: boolean;
}

@Component({
  selector: 'gog-select-dropdown-portal',
  imports: [IconComponent],
  template: `
    <div
      [id]="listboxId"
      class="gog-select__dropdown gog-select__dropdown--portal"
      [class.gog-select__dropdown--sm]="size === 'sm'"
      [class.gog-select__dropdown--lg]="size === 'lg'"
      [style.top.px]="top"
      [style.left.px]="left"
      [style.width.px]="width"
      [style.max-height.px]="maxHeight"
      [style.z-index]="zIndex"
      role="listbox"
    >
      @for (option of options; track option.id) {
        <button
          type="button"
          class="gog-select__option font-body"
          role="option"
          [attr.aria-selected]="isSelected(option.id)"
          [attr.aria-disabled]="option.disabled ?? false"
          [class.gog-select__option--selected]="isSelected(option.id)"
          [class.gog-select__option--disabled]="option.disabled ?? false"
          (click)="onSelect(option, $event)"
          (keydown)="onOptionKeydown($event)"
        >
          <span class="gog-select__option-mark" aria-hidden="true">
            @if (isSelected(option.id)) {
              <gog-icon name="check" />
            }
          </span>
          <span class="gog-select__option-label">{{ option.name }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GogSelectDropdownPortal {
  top = 0;
  left = 0;
  width = 200;
  maxHeight = 260;
  zIndex = 300;
  listboxId = '';
  direction: 'up' | 'down' = 'down';
  size: GogSize = 'md';
  options: GogSelectOption[] = [];
  selectedValue: string | number | null = null;
  onSelect: (option: GogSelectOption, event: MouseEvent) => void = () => {};
  onOptionKeydown: (event: KeyboardEvent) => void = () => {};

  isSelected(id: string | number): boolean {
    return this.selectedValue === id;
  }
}

@Component({
  selector: 'gog-select',
  imports: [IconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(window:scroll)': 'onScrollOrResize()',
    '(window:resize)': 'onScrollOrResize()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  private static nextId = 0;

  private readonly generatedId = `gog-select-${++SelectComponent.nextId}`;
  private readonly generatedListboxId = `gog-select-listbox-${SelectComponent.nextId}`;

  readonly inputId = input('');
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Select...');
  readonly options = input<GogSelectOption[]>([]);
  readonly errorMessage = input('');
  readonly size = input<GogSize>('md');
  readonly dropdownDirection = input<GogDropdownDirection>('auto');
  readonly dropdownZIndex = input<number | null>(null);
  readonly appendToBody = input(false);
  readonly disabled = input(false);
  readonly chevronTemplate = input<TemplateRef<unknown> | null>(null);

  /** Two-way bindable selected value: `[(value)]="signal"`. */
  readonly value = model<string | number | null>(null);
  readonly isOpen = signal(false);

  private readonly cvaDisabled = signal(false);
  protected readonly dropdownDirectionState = signal<'up' | 'down'>('down');
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly triggerId = computed(() => this.inputId() || this.generatedId);
  protected readonly listboxId = computed(() => this.inputId() ? `${this.inputId()}-listbox` : this.generatedListboxId);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly selectedOption = computed(
    () => this.options().find((option) => String(option.id) === String(this.value())) ?? null,
  );
  /**
   * Consumer-controlled: shown for as long as `errorMessage` is non-empty. The
   * consumer decides when to clear it, rather than the field silently hiding it
   * once something is selected.
   */
  protected readonly hasError = computed(() => !!this.errorMessage());
  protected readonly errorId = computed(() => (this.hasError() ? `${this.triggerId()}-error` : null));

  private portalHost: HTMLElement | null = null;
  private portalRef: ReturnType<typeof createComponent<GogSelectDropdownPortal>> | null = null;

  private onChange: (val: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyPortal());
  }

  writeValue(val: string | number | null): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.openDropdown();
    } else {
      this.destroyPortal();
    }
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.destroyPortal();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node | null;
    const insideTrigger = target ? this.elRef.nativeElement.contains(target) : false;
    const insidePortal = target ? this.portalHost?.contains(target) ?? false : false;

    if (!insideTrigger && !insidePortal) {
      this.close();
    }
  }

  protected onScrollOrResize(): void {
    if (!this.isOpen()) return;
    if (this.appendToBody()) {
      this.updatePortalPosition();
      return;
    }
    this.updateInlineDirection();
  }

  protected selectOption(option: GogSelectOption, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (option.disabled) {
      return;
    }

    this.value.set(option.id);
    this.onChange(option.id);
    this.onTouched();
    this.close();
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
      scope.querySelectorAll<HTMLButtonElement>('.gog-select__option:not([aria-disabled="true"])'),
    );
  }

  private focusTrigger(): void {
    (this.elRef.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.gog-select__control')?.focus();
  }

  private openDropdown(): void {
    this.onTouched();
    if (this.appendToBody()) {
      this.openPortal();
      return;
    }
    this.updateInlineDirection();
  }

  private estimatePanelHeight(): number {
    return Math.min(Math.max(this.options().length, 1) * 40, 260);
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

    this.portalRef = createComponent(GogSelectDropdownPortal, {
      environmentInjector: this.envInjector,
      hostElement: this.portalHost,
    });

    const inst = this.portalRef.instance;
    inst.options = this.options();
    inst.selectedValue = this.value();
    inst.listboxId = this.listboxId();
    inst.zIndex = this.dropdownZIndex() ?? 300;
    inst.size = this.size();
    inst.onSelect = (option, event) => this.selectOption(option, event);
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

    const inst = this.portalRef.instance;
    inst.direction = placement.direction;
    inst.top = placement.top;
    inst.left = placement.left;
    inst.width = placement.width;
    inst.maxHeight = placement.maxHeight;
    inst.zIndex = this.dropdownZIndex() ?? 300;
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
