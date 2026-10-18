import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AccordionComponent,
  AlertComponent,
  AutocompleteComponent,
  ButtonComponent,
  ButtonToggleGroupComponent,
  CardComponent,
  CheckboxComponent,
  AvatarComponent,
  AvatarGroupComponent,
  BreadcrumbsComponent,
  StepperComponent,
  FileUploadComponent,
  RatingComponent,
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  GogEmptyStateMediaDirective,
  GogBreadcrumbDirective,
  ChipComponent,
  CollapsibleComponent,
  DividerComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
  GogAlertIconDirective,
  GogBadgeDirective,
  GogButtonDirective,
  GogButtonToggleOptionDirective,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  GogCardMediaDirective,
  GogCheckboxIconDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  type GogDateRange,
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  GogMultiselectClearIconDirective,
  GogPanelFooterDirective,
  GogPanelHeaderDirective,
  GogRippleDirective,
  type GogSize,
  type GogSliderRange,
  GogTabContentDirective,
  GogTabHeaderDirective,
  GogTagIconDirective,
  GogTooltipDirective,
  IconComponent,
  InputfieldComponent,
  MenuComponent,
  MultiselectComponent,
  PaginatorComponent,
  PanelComponent,
  ProgressbarComponent,
  RadioGroupComponent,
  ScrollComponent,
  SelectComponent,
  SkeletonComponent,
  SliderComponent,
  SpinnerComponent,
  SpinnerOverlayComponent,
  TabComponent,
  TabsComponent,
  TagComponent,
  TextareaComponent,
  ThemeService,
  ToastService,
  ToggleComponent,
  PopoverComponent,
  GogPopoverTriggerDirective,
  ContextMenuComponent,
  GogContextMenuContentDirective,
  GogContextMenuTriggerDirective,
  startOfDay,
  type GogIconName,
  type GogSeverity,
} from '@guildofgleks/ui';
import { CalendarComponent, DatepickerComponent } from '@guildofgleks/ui/datepicker';
import {
  ConfirmationDialogComponent,
  type ConfirmDialogData,
  DialogService,
} from '@guildofgleks/ui/dialog';
import {
  GogColumn,
  GogColumnBodyDirective,
  GogTableEmptyDirective,
  GogColumnHeaderDirective,
  TableComponent,
} from '@guildofgleks/ui/table';
import { GogSchedulerEventDirective, SchedulerComponent } from '@guildofgleks/ui/scheduler';

import {
  ACTIVITY,
  APPEARANCES,
  CITIES,
  COUNTRIES,
  CUSTOMER_OPTIONS,
  FAQ_ITEMS,
  LANGUAGES,
  NOTIFICATION_ITEMS,
  type Order,
  ORDERS,
  PERIODS,
  PLANS,
  PRIORITIES,
  SESSIONS,
  SIZES,
  STATUS_OPTIONS,
  STATUS_VARIANT,
  TAG_OPTIONS,
} from './specimen-data';

/**
 * Every component of the library at least twice, composed into two screens an app might have. The
 * page's own toolbar sets `size` and `disabled` on every instance that takes them, so spacing,
 * alignment and a theme can be checked across the whole set at once. `specimen-page.spec.ts`
 * keeps the "at least twice" true.
 */
@Component({
  selector: 'app-specimen-page',
  imports: [
    DecimalPipe,
    AccordionComponent,
    AlertComponent,
    AutocompleteComponent,
    ButtonComponent,
    ButtonToggleGroupComponent,
    CalendarComponent,
    CardComponent,
    CheckboxComponent,
    AvatarComponent,
    AvatarGroupComponent,
    BreadcrumbsComponent,
    StepperComponent,
    FileUploadComponent,
    RatingComponent,
    EmptyStateComponent,
    GogEmptyStateActionsDirective,
    GogEmptyStateMediaDirective,
    GogBreadcrumbDirective,
    ChipComponent,
    CollapsibleComponent,
    DatepickerComponent,
    DividerComponent,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    GogAccordionHeaderDirective,
    GogAlertIconDirective,
    GogBadgeDirective,
    GogButtonDirective,
    GogButtonToggleOptionDirective,
    GogCardFooterDirective,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    GogCardMediaDirective,
    GogCheckboxIconDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    GogColumn,
    GogColumnBodyDirective,
    GogTableEmptyDirective,
    GogSchedulerEventDirective,
    SchedulerComponent,
    PopoverComponent,
    GogPopoverTriggerDirective,
    ContextMenuComponent,
    GogContextMenuContentDirective,
    GogContextMenuTriggerDirective,
    GogColumnHeaderDirective,
    GogDropdownChevronDirective,
    GogDropdownOptionDirective,
    GogInputAddonEndDirective,
    GogInputAddonStartDirective,
    GogMenuItemDirective,
    GogMenuTriggerDirective,
    GogMultiselectClearIconDirective,
    GogPanelFooterDirective,
    GogPanelHeaderDirective,
    GogRippleDirective,
    GogTabContentDirective,
    GogTabHeaderDirective,
    GogTagIconDirective,
    GogTooltipDirective,
    IconComponent,
    InputfieldComponent,
    MenuComponent,
    MultiselectComponent,
    PaginatorComponent,
    PanelComponent,
    ProgressbarComponent,
    RadioGroupComponent,
    ScrollComponent,
    SelectComponent,
    SkeletonComponent,
    SliderComponent,
    SpinnerComponent,
    SpinnerOverlayComponent,
    TabComponent,
    TableComponent,
    TabsComponent,
    TagComponent,
    TextareaComponent,
    ToggleComponent,
  ],
  templateUrl: './specimen-page.html',
  styleUrl: './specimen-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenPage {
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly themes = inject(ThemeService);

  // The page's own switches.
  protected readonly sizes = SIZES;
  protected readonly size = signal<GogSize>('md');
  protected readonly disabled = signal(false);
  protected readonly busy = signal(false);

  // Account settings.
  protected readonly countries = COUNTRIES;
  protected readonly cities = CITIES;
  protected readonly languages = LANGUAGES;
  protected readonly plans = PLANS;
  protected readonly appearances = APPEARANCES;
  protected readonly notificationItems = NOTIFICATION_ITEMS;
  protected readonly sessions = SESSIONS;

  protected readonly fullName = signal('Mila Kovacs');
  protected readonly buyers = ['Ana Petrova', 'Jonas Berg', 'Lea Novak', 'Tomas Ruiz', 'Yuki Sato'];
  protected readonly setupSteps = [
    { label: 'Profile', state: 'complete' as const },
    { label: 'Team' },
    { label: 'Billing' },
  ];
  protected readonly setupStep = signal(1);
  protected readonly fulfilmentSteps = [
    { label: 'Paid', description: 'Card ending 4242', state: 'complete' as const },
    { label: 'Packed', state: 'complete' as const },
    { label: 'Shipped', description: 'Carrier rejected the label', state: 'error' as const },
    { label: 'Delivered' },
  ];
  protected readonly fulfilmentStep = signal(2);
  protected readonly email = signal('mila@');
  protected readonly website = signal('gleks.example');
  protected readonly bio = signal('Runs the finance team. Prefers spreadsheets to meetings.');
  protected readonly country = signal<string | number | null>('ua');
  protected readonly city = signal<string | number | null>('kyiv');
  protected readonly spoken = signal<(string | number)[]>(['en', 'uk']);
  protected readonly birthday = signal<Date | GogDateRange | null>(new Date(1990, 4, 17));
  protected readonly plan = signal<string | number | null>('team');
  protected readonly digestLimit = signal(12);
  protected readonly appRating = signal<number | null>(null);
  protected readonly publicProfile = signal(true);
  protected readonly terms = signal(false);
  protected readonly mentions = signal(true);
  protected readonly failures = signal(true);
  protected readonly available = signal<Date | GogDateRange | null>(null);
  protected readonly password = signal('correct horse');
  protected readonly sessionsPage = signal(1);
  protected readonly advancedOpen = signal(false);
  protected readonly settingsTab = signal(0);

  /** Today: the specimen's schedules sit around it, in whichever week the locale draws. */
  private readonly today = startOfDay(new Date());
  private readonly at = (day: number, hour = 0) =>
    new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + day, hour);
  protected readonly away = ['Mila Kovacs', 'Jonas Berg'];
  protected readonly tileNames = ['quick actions'];
  /** The colleague a right-click landed on; between names the browser's own menu opens. */
  protected readonly personAt = (target: HTMLElement): string | null =>
    target.closest<HTMLElement>('[data-person]')?.dataset['person'] ?? null;
  protected messageColleague(person: string | null): void {
    if (person) this.toasts.info(`Message to ${person}`);
  }

  protected readonly timeOff: readonly {
    title: string;
    icon: GogIconName;
    start: Date;
    end: Date;
    allDay: boolean;
    variant: GogSeverity;
  }[] = [
    {
      title: 'Mila — leave',
      icon: 'sun',
      start: this.at(1),
      end: this.at(4),
      allDay: true,
      variant: 'info',
    },
    {
      title: 'Jonas — sick',
      icon: 'heart',
      start: this.at(3),
      end: this.at(4),
      allDay: true,
      variant: 'warning',
    },
    {
      title: 'Team offsite',
      icon: 'users',
      start: this.at(9),
      end: this.at(11),
      allDay: true,
      variant: 'success',
    },
  ];
  protected readonly deliveries = [
    {
      carrier: 'DHL',
      orders: 14,
      start: this.at(0, 9),
      end: this.at(0, 10),
      variant: 'accent' as const,
    },
    {
      carrier: 'UPS',
      orders: 6,
      start: this.at(0, 9),
      end: this.at(0, 11),
      variant: 'info' as const,
    },
    {
      carrier: 'Nova Poshta',
      orders: 22,
      start: this.at(2, 14),
      end: this.at(2, 16),
      variant: 'success' as const,
    },
    {
      carrier: 'DPD',
      orders: 3,
      start: this.at(4, 7),
      end: this.at(4, 8),
      variant: 'danger' as const,
    },
  ];

  protected readonly emailError = computed(() =>
    this.email().includes('.') ? '' : 'Enter a full address, like name@example.com',
  );
  protected readonly strength = computed(() => Math.min(100, this.password().length * 8));
  protected readonly appearance = computed(() =>
    this.themes.theme() === 'dark' ? 'dark' : 'light',
  );

  // Orders.
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusVariant = STATUS_VARIANT;
  protected readonly tagOptions = TAG_OPTIONS;
  protected readonly customerOptions = CUSTOMER_OPTIONS;
  protected readonly periods = PERIODS;
  protected readonly priorities = PRIORITIES;
  protected readonly faqItems = FAQ_ITEMS;
  protected readonly activity = ACTIVITY;

  protected readonly search = signal('');
  protected readonly status = signal<string | number | null>(null);
  protected clearFilters(): void {
    this.search.set('');
    this.status.set(null);
  }
  protected readonly tags = signal<(string | number)[]>(['priority']);
  protected readonly customer = signal<string | number | null>(null);
  protected readonly range = signal<Date | GogDateRange | null>(null);
  protected readonly period = signal<string | number | null>('week');
  protected readonly onlyMine = signal(true);
  protected readonly overdue = signal(false);
  protected readonly priority = signal<string | number | null>('any');
  protected readonly totals = signal<GogSliderRange>({ start: 20, end: 80 });
  protected readonly note = signal('');
  protected readonly selected = signal<Order[]>([]);
  protected readonly activityPage = signal(2);
  protected readonly filtersOpen = signal(true);
  protected readonly alertShown = signal(true);
  protected readonly ordersTab = signal(0);
  protected readonly chipFilters = signal({ paid: true, pending: false, refunded: false });
  protected readonly minTotal = signal('');
  /** The row whose action button opened the shared row menu. */
  protected readonly menuOrder = signal<Order | null>(null);

  protected readonly orders = computed(() => {
    const query = this.search().trim().toLowerCase();
    return ORDERS.filter(
      (order) =>
        (!query || `${order.id} ${order.customer}`.toLowerCase().includes(query)) &&
        (this.status() === null || order.status === this.status()),
    );
  });

  protected removeTag(tag: string | number): void {
    this.tags.update((tags) => tags.filter((candidate) => candidate !== tag));
  }

  protected setAppearance(value: unknown): void {
    if (value === 'light' || value === 'dark') this.themes.setTheme(value);
  }

  protected toggleChip(key: 'paid' | 'pending' | 'refunded', on: boolean | null): void {
    this.chipFilters.update((filters) => ({ ...filters, [key]: on === true }));
  }

  protected saveSettings(): void {
    this.toasts.success('Settings saved.');
  }

  protected exportOrders(): void {
    this.toasts.info(`Exporting ${this.orders().length} orders…`, {
      actions: [{ label: 'Cancel', onClick: (toast) => this.toasts.dismiss(toast.id) }],
    });
  }

  protected deleteAccount(): void {
    this.confirm({
      title: 'Delete this account?',
      description: 'Every report you own moves to the team.',
      confirmText: 'Delete',
      cancelText: 'Keep',
    });
  }

  protected refund(): void {
    const order = this.menuOrder();
    if (!order) return;
    this.confirm({
      title: `Refund ${order.total} to ${order.customer}?`,
      description: 'The customer is notified by email.',
      confirmText: 'Refund',
      cancelText: 'Cancel',
    });
  }

  /** Named by the confirmation's own heading, so the question is not shown twice. */
  private confirm(data: ConfirmDialogData): void {
    const { confirmText } = data;
    const titleId = 'specimen-confirm-question';
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      ariaLabelledBy: titleId,
      data: { ...data, titleId },
    });
    void handle.afterClosed.then((confirmed) => {
      if (confirmed) this.toasts.warning(`${confirmText}: done.`);
    });
  }
}
