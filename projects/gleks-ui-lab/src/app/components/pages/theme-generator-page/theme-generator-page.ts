import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AccordionComponent,
  ButtonComponent,
  CheckboxComponent,
  ChipComponent,
  Column,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  GogAccordionContentDirective,
  IconComponent,
  InputfieldComponent,
  MultiselectComponent,
  PaginatorComponent,
  SelectComponent,
  SkeletonComponent,
  SliderComponent,
  SpinnerComponent,
  TableComponent,
  TagComponent,
  ToastComponent,
  type ConfirmDialogData,
  type GogDropdownOption,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { injectFullLibraryCss } from '../../shared/full-library-css';
import { GENERATOR_COMPONENTS, extractTokenNames } from './generator-catalog';
import {
  PREVIEW_ACCORDION_ITEMS,
  PREVIEW_MULTISELECT_OPTIONS,
  PREVIEW_SELECT_OPTIONS,
  PREVIEW_TABLE_ROWS,
  PREVIEW_TOAST,
} from './preview-fixtures';

@Component({
  selector: 'app-theme-generator-page',
  imports: [
    RouterLink,
    MarkdownComponent,
    AccordionComponent,
    GogAccordionContentDirective,
    ButtonComponent,
    CheckboxComponent,
    ChipComponent,
    DialogComponent,
    IconComponent,
    InputfieldComponent,
    MultiselectComponent,
    PaginatorComponent,
    SelectComponent,
    SkeletonComponent,
    SliderComponent,
    SpinnerComponent,
    TableComponent,
    Column,
    TagComponent,
    ToastComponent,
  ],
  templateUrl: './theme-generator-page.html',
  styleUrl: './theme-generator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeGeneratorPage {
  private readonly dialogService = inject(DialogService);
  private readonly fullLibraryCss = injectFullLibraryCss();
  private readonly previewWrapper = viewChild<ElementRef<HTMLElement>>('previewWrapper');

  protected readonly components = GENERATOR_COMPONENTS;
  protected readonly componentOptions: GogDropdownOption[] = GENERATOR_COMPONENTS.map((c) => ({
    id: c.id,
    name: c.label,
  }));

  protected readonly selectedComponentId = signal<string>('button');
  protected readonly selectedLabel = computed(
    () => this.components.find((c) => c.id === this.selectedComponentId())?.label ?? '',
  );
  // Edits the user made this session — cleared on component switch and on page reload.
  protected readonly overrides = signal<Record<string, string>>({});
  private readonly defaults = signal<Record<string, string>>({});

  protected readonly tokenNames = computed(() => {
    const css = this.fullLibraryCss();
    if (!css) return [];
    const def = this.components.find((c) => c.id === this.selectedComponentId());
    return def ? extractTokenNames(css, def.prefixes) : [];
  });

  protected readonly previewStyle = computed(() =>
    Object.entries(this.overrides())
      .map(([name, value]) => `${name}: ${value}`)
      .join('; '),
  );

  protected readonly generatedCssMarkdown = computed(() => {
    const names = this.tokenNames();
    if (names.length === 0) return undefined;

    const overrides = this.overrides();
    const defaults = this.defaults();
    const lines = names.map((name) => `  ${name}: ${overrides[name] ?? defaults[name] ?? ''};`);
    return '```css\n:root {\n' + lines.join('\n') + '\n}\n```';
  });

  // Preview fixtures for the @switch block in the template.
  protected readonly accordionItems = PREVIEW_ACCORDION_ITEMS;
  protected readonly selectOptions = PREVIEW_SELECT_OPTIONS;
  protected readonly multiselectOptions = PREVIEW_MULTISELECT_OPTIONS;
  protected readonly tableRows = PREVIEW_TABLE_ROWS;
  protected readonly previewToast = PREVIEW_TOAST;

  constructor() {
    // Reads the *resolved* default value of every token straight off the live preview
    // element, so it always matches whatever theme (light/dark) is currently active —
    // instead of re-deriving the cascade by hand from the stylesheet text.
    effect(() => {
      const names = this.tokenNames();
      if (typeof window === 'undefined') return;

      const el = this.previewWrapper()?.nativeElement;
      if (!el) return;

      const computedStyle = getComputedStyle(el);
      const nextDefaults: Record<string, string> = {};
      for (const name of names) {
        nextDefaults[name] = computedStyle.getPropertyValue(name).trim();
      }
      this.defaults.set(nextDefaults);
    });
  }

  protected currentValue(name: string): string {
    return this.overrides()[name] ?? this.defaults()[name] ?? '';
  }

  protected onComponentChange(value: string | number | null): void {
    if (typeof value !== 'string') return;
    this.selectedComponentId.set(value);
    this.overrides.set({});
  }

  protected onTokenInput(name: string, value: string): void {
    this.overrides.update((current) => ({ ...current, [name]: value }));
  }

  protected resetToken(name: string): void {
    this.overrides.update((current) => {
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }

  protected resetAll(): void {
    this.overrides.set({});
  }

  protected openDialogPreview(): void {
    this.dialogService.open<boolean>({
      title: 'Preview dialog',
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      data: {
        title: 'Delete workspace?',
        description: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });
  }
}
