import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AccordionComponent,
  AutocompleteComponent,
  GogBadgeDirective,
  ButtonComponent,
  ButtonToggleGroupComponent,
  CalendarComponent,
  CheckboxComponent,
  ChipComponent,
  GogColumn,
  ConfirmationDialogComponent,
  DatepickerComponent,
  DialogComponent,
  DialogService,
  DividerComponent,
  GogAccordionContentDirective,
  IconComponent,
  InputfieldComponent,
  MultiselectComponent,
  PaginatorComponent,
  ProgressbarComponent,
  RadioGroupComponent,
  ScrollComponent,
  SelectComponent,
  SkeletonComponent,
  SliderComponent,
  SpinnerComponent,
  TabComponent,
  TableComponent,
  TabsComponent,
  TagComponent,
  ToastComponent,
  ToggleComponent,
  GogTooltipDirective,
  type ConfirmDialogData,
  type GogDropdownOption,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { injectFullLibraryCss } from '../../shared/full-library-css';
import { ThemeGeneratorState } from '../../shared/theme-generator-state';
import { classifyToken, type TokenControl } from '../../shared/token-value';
import { GENERATOR_COMPONENTS, extractTokenNames } from './generator-catalog';
import { FOUNDATION_GROUPS, FOUNDATION_TOKEN_NAMES } from './foundation-tokens';
import { randomizeFoundation } from './theme-random';
import { TokenRowEditor } from './token-row-editor';
import {
  PREVIEW_ACCORDION_ITEMS,
  PREVIEW_MULTISELECT_OPTIONS,
  PREVIEW_RADIO_OPTIONS,
  PREVIEW_SELECT_OPTIONS,
  PREVIEW_TABLE_ROWS,
  PREVIEW_TOAST,
} from './preview-fixtures';

interface TokenRowView {
  readonly name: string;
  readonly control: TokenControl;
}

interface FoundationGroupView {
  readonly title: string;
  readonly rows: readonly TokenRowView[];
}

@Component({
  selector: 'app-theme-generator-page',
  imports: [
    RouterLink,
    MarkdownComponent,
    TokenRowEditor,
    AccordionComponent,
    GogAccordionContentDirective,
    AutocompleteComponent,
    GogBadgeDirective,
    ButtonComponent,
    ButtonToggleGroupComponent,
    CalendarComponent,
    CheckboxComponent,
    ChipComponent,
    DatepickerComponent,
    DialogComponent,
    DividerComponent,
    IconComponent,
    InputfieldComponent,
    MultiselectComponent,
    PaginatorComponent,
    ProgressbarComponent,
    RadioGroupComponent,
    ScrollComponent,
    SelectComponent,
    SkeletonComponent,
    SliderComponent,
    SpinnerComponent,
    TableComponent,
    GogColumn,
    TabComponent,
    TabsComponent,
    TagComponent,
    ToastComponent,
    ToggleComponent,
    GogTooltipDirective,
  ],
  templateUrl: './theme-generator-page.html',
  styleUrl: './theme-generator-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeGeneratorPage {
  private readonly dialogService = inject(DialogService);
  private readonly fullLibraryCss = injectFullLibraryCss();
  protected readonly state = inject(ThemeGeneratorState);

  // ── Foundation editor — edit one of these, everything derived from it updates at once. ──
  protected readonly foundationGroups = computed<FoundationGroupView[]>(() =>
    FOUNDATION_GROUPS.map((group) => ({
      title: group.title,
      rows: group.tokens.map((name) => ({
        name,
        control: classifyToken(this.state.defaultOf(name)),
      })),
    })),
  );

  protected readonly exportCssMarkdown = computed(() => {
    const lines: string[] = [];
    for (const group of FOUNDATION_GROUPS) {
      lines.push(`  /* ${group.title} */`);
      for (const name of group.tokens) {
        lines.push(`  ${name}: ${this.state.currentValue(name)};`);
      }
    }

    const foundationSet = new Set<string>(FOUNDATION_TOKEN_NAMES);
    const componentOverrides = Object.keys(this.state.overrides()).filter(
      (name) => !foundationSet.has(name),
    );

    let css = '```css\n:root {\n' + lines.join('\n') + '\n}\n```';
    if (componentOverrides.length > 0) {
      const componentLines = componentOverrides
        .sort()
        .map((name) => `  ${name}: ${this.state.currentValue(name)};`);
      css +=
        '\n\n```css\n/* Fine-tuned individually, below */\n:root {\n' +
        componentLines.join('\n') +
        '\n}\n```';
    }
    return css;
  });

  // Every `--gog-*` token the installed library declares, not just the 44 foundation ones —
  // for double-checking that the compact block above really does reproduce everything visible.
  // Most of these are never written directly; they read `var(--gog-accent-color)` etc. in the
  // real stylesheet, so their *value* changes when a foundation token does even though the
  // *declaration* doesn't — which is why randomizing 44 tokens visibly changes far more than
  // 44 things on screen.
  protected readonly allTokenNames = computed(() => {
    const css = this.fullLibraryCss();
    return css ? extractTokenNames(css, ['--gog-']) : [];
  });

  protected readonly fullyResolvedCssMarkdown = computed(() => {
    const names = this.allTokenNames();
    if (names.length === 0) return undefined;

    const lines = names.map((name) => `  ${name}: ${this.state.currentValue(name)};`);
    return '```css\n:root {\n' + lines.join('\n') + '\n}\n```';
  });

  protected readonly fullyResolvedSections = [
    { id: 'fully-resolved', title: 'Show every token, fully resolved (advanced)' },
  ];

  // ── Fine-tune a single component (secondary/advanced) ──────────────────────────────────
  protected readonly components = GENERATOR_COMPONENTS;
  protected readonly componentOptions: GogDropdownOption[] = GENERATOR_COMPONENTS.map((c) => ({
    id: c.id,
    name: c.label,
  }));

  protected readonly selectedComponentId = signal<string>('button');
  protected readonly selectedLabel = computed(
    () => this.components.find((c) => c.id === this.selectedComponentId())?.label ?? '',
  );

  protected readonly tokenNames = computed(() => {
    const css = this.fullLibraryCss();
    if (!css) return [];
    const def = this.components.find((c) => c.id === this.selectedComponentId());
    return def ? extractTokenNames(css, def.prefixes) : [];
  });

  // The control kind is derived from each token's *default* value, not whatever's currently
  // typed into it, so it doesn't reclassify mid-edit — a fixed property of the token, not of
  // the current edit state.
  protected readonly tokenRows = computed<TokenRowView[]>(() =>
    this.tokenNames().map((name) => ({ name, control: classifyToken(this.state.defaultOf(name)) })),
  );

  // Preview fixtures for the component gallery.
  protected readonly accordionItems = PREVIEW_ACCORDION_ITEMS;
  protected readonly selectOptions = PREVIEW_SELECT_OPTIONS;
  protected readonly multiselectOptions = PREVIEW_MULTISELECT_OPTIONS;
  protected readonly radioOptions = PREVIEW_RADIO_OPTIONS;
  protected readonly tableRows = PREVIEW_TABLE_ROWS;
  protected readonly previewToast = PREVIEW_TOAST;
  protected readonly today = new Date();

  constructor() {
    // Captures every foundation token's real default once, up front — the gallery and the
    // Foundation editor both need it immediately, not just whichever component is selected
    // in the fine-tune dropdown below.
    effect(() => this.state.captureDefaults(FOUNDATION_TOKEN_NAMES));
    // Captures the fine-tune section's tokens the moment their names first appear — before
    // any override the user makes could shadow it (see ThemeGeneratorState.captureDefaults).
    effect(() => this.state.captureDefaults(this.tokenNames()));
    // Captures every token in the library for the "fully resolved" export block below.
    effect(() => this.state.captureDefaults(this.allTokenNames()));
  }

  protected currentValue(name: string): string {
    return this.state.currentValue(name);
  }

  protected isOverridden(name: string): boolean {
    return name in this.state.overrides();
  }

  protected randomizeAll(): void {
    // Anchored to each token's real shipped *default*, never its current (possibly already
    // randomized) value — jittering off the current value compounds across repeated clicks,
    // since classifyToken's slider bounds scale with whatever value they're fed. A few clicks
    // in, everything drifts toward unusably huge. Anchoring to the fixed default means every
    // click samples fresh from the same bounded range, no matter how many times it's pressed.
    const random = randomizeFoundation((name) => this.state.defaultOf(name));
    for (const [name, value] of Object.entries(random)) {
      this.state.set(name, value);
    }
  }

  protected onComponentChange(value: string | number | null): void {
    if (typeof value !== 'string') return;
    this.selectedComponentId.set(value);
  }

  protected onTokenInput(name: string, value: string): void {
    this.state.set(name, value);
  }

  protected resetToken(name: string): void {
    this.state.reset(name);
  }

  protected resetAll(): void {
    this.state.resetAll();
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
