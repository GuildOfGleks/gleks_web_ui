import type { Type } from '@angular/core';
import {
  AccordionComponent,
  AlertComponent,
  AutocompleteComponent,
  ButtonComponent,
  ButtonToggleGroupComponent,
  CardComponent,
  CheckboxComponent,
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
  TabsComponent,
  TagComponent,
  TextareaComponent,
  ThemeService,
  ToastComponent,
  ToastContainerComponent,
  ToastService,
  ToggleComponent,
} from '@guildofgleks/ui';
import { CalendarComponent, DatepickerComponent } from '@guildofgleks/ui/datepicker';
import {
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
} from '@guildofgleks/ui/dialog';
import {
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  TableComponent,
} from '@guildofgleks/ui/table';

export type GogUnitGroup = 'actions' | 'form' | 'display' | 'layout' | 'overlay' | 'foundation';
export type GogEntryPoint = 'root' | 'table' | 'datepicker' | 'dialog';

export type GogPart =
  | { readonly kind: 'component'; readonly type: Type<unknown> }
  /** A directive's selector is not readable through public Angular API, so it is written here; the spec checks it. */
  | { readonly kind: 'directive'; readonly type: Type<unknown>; readonly selector: string }
  | { readonly kind: 'service'; readonly type: Type<unknown> };

/** One documentation page: a component and everything a consumer uses only together with it. */
export interface GogUnit {
  readonly id: string;
  readonly name: string;
  readonly group: GogUnitGroup;
  readonly entry: GogEntryPoint;
  /** Primary part first. */
  readonly parts: readonly GogPart[];
  /** Whether the rebuilt page for this unit exists yet. */
  readonly page: boolean;
}

export const GROUP_LABELS: Readonly<Record<GogUnitGroup, string>> = {
  actions: 'Actions',
  form: 'Form controls',
  display: 'Display & feedback',
  layout: 'Layout & navigation',
  overlay: 'Overlays',
  foundation: 'Foundation',
};

const cmp = (type: Type<unknown>): GogPart => ({ kind: 'component', type });
const dir = (type: Type<unknown>, selector: string): GogPart => ({
  kind: 'directive',
  type,
  selector,
});
const svc = (type: Type<unknown>): GogPart => ({ kind: 'service', type });

export const UNITS: readonly GogUnit[] = [
  // Actions
  {
    id: 'button',
    name: 'Button',
    group: 'actions',
    entry: 'root',
    parts: [cmp(ButtonComponent), dir(GogButtonDirective, 'a[gogButton], button[gogButton]')],
    page: false,
  },
  {
    id: 'button-toggle',
    name: 'Button toggle',
    group: 'actions',
    entry: 'root',
    parts: [
      cmp(ButtonToggleGroupComponent),
      dir(GogButtonToggleOptionDirective, '[gogButtonToggleOption]'),
    ],
    page: false,
  },

  // Form controls
  {
    id: 'inputfield',
    name: 'Inputfield',
    group: 'form',
    entry: 'root',
    parts: [
      cmp(InputfieldComponent),
      dir(GogInputAddonStartDirective, '[gogInputAddonStart]'),
      dir(GogInputAddonEndDirective, '[gogInputAddonEnd]'),
    ],
    page: false,
  },
  {
    id: 'textarea',
    name: 'Textarea',
    group: 'form',
    entry: 'root',
    parts: [cmp(TextareaComponent)],
    page: false,
  },
  {
    id: 'select',
    name: 'Select',
    group: 'form',
    entry: 'root',
    parts: [cmp(SelectComponent)],
    page: false,
  },
  {
    id: 'multiselect',
    name: 'Multiselect',
    group: 'form',
    entry: 'root',
    parts: [
      cmp(MultiselectComponent),
      dir(GogMultiselectClearIconDirective, '[gogMultiselectClearIcon]'),
    ],
    page: false,
  },
  {
    id: 'autocomplete',
    name: 'Autocomplete',
    group: 'form',
    entry: 'root',
    parts: [cmp(AutocompleteComponent)],
    page: false,
  },
  {
    id: 'dropdown-templates',
    name: 'Dropdown templates',
    group: 'form',
    entry: 'root',
    parts: [
      dir(GogDropdownOptionDirective, '[gogDropdownOption]'),
      dir(GogDropdownChevronDirective, '[gogDropdownChevron]'),
    ],
    page: false,
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    group: 'form',
    entry: 'root',
    parts: [cmp(CheckboxComponent), dir(GogCheckboxIconDirective, '[gogCheckboxIcon]')],
    page: false,
  },
  {
    id: 'toggle',
    name: 'Toggle',
    group: 'form',
    entry: 'root',
    parts: [cmp(ToggleComponent)],
    page: false,
  },
  {
    id: 'radio-group',
    name: 'Radio group',
    group: 'form',
    entry: 'root',
    parts: [cmp(RadioGroupComponent)],
    page: false,
  },
  {
    id: 'slider',
    name: 'Slider',
    group: 'form',
    entry: 'root',
    parts: [cmp(SliderComponent)],
    page: false,
  },
  {
    id: 'datepicker',
    name: 'Datepicker',
    group: 'form',
    entry: 'datepicker',
    parts: [cmp(DatepickerComponent), cmp(CalendarComponent)],
    page: false,
  },

  // Display & feedback
  {
    id: 'icon',
    name: 'Icon',
    group: 'display',
    entry: 'root',
    parts: [cmp(IconComponent)],
    page: false,
  },
  {
    id: 'badge',
    name: 'Badge',
    group: 'display',
    entry: 'root',
    parts: [dir(GogBadgeDirective, '[gogBadge]')],
    page: false,
  },
  {
    id: 'chip',
    name: 'Chip',
    group: 'display',
    entry: 'root',
    parts: [cmp(ChipComponent)],
    page: false,
  },
  {
    id: 'tag',
    name: 'Tag',
    group: 'display',
    entry: 'root',
    parts: [cmp(TagComponent), dir(GogTagIconDirective, '[gogTagIcon]')],
    page: false,
  },
  {
    id: 'alert',
    name: 'Alert',
    group: 'display',
    entry: 'root',
    parts: [cmp(AlertComponent), dir(GogAlertIconDirective, '[gogAlertIcon]')],
    page: false,
  },
  {
    id: 'spinner',
    name: 'Spinner',
    group: 'display',
    entry: 'root',
    parts: [cmp(SpinnerComponent), cmp(SpinnerOverlayComponent)],
    page: false,
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    group: 'display',
    entry: 'root',
    parts: [cmp(SkeletonComponent)],
    page: false,
  },
  {
    id: 'progressbar',
    name: 'Progressbar',
    group: 'display',
    entry: 'root',
    parts: [cmp(ProgressbarComponent)],
    page: false,
  },
  {
    id: 'divider',
    name: 'Divider',
    group: 'display',
    entry: 'root',
    parts: [cmp(DividerComponent)],
    page: false,
  },
  {
    id: 'ripple',
    name: 'Ripple',
    group: 'display',
    entry: 'root',
    parts: [dir(GogRippleDirective, '[gogRipple]')],
    page: false,
  },

  // Layout & navigation
  {
    id: 'card',
    name: 'Card',
    group: 'layout',
    entry: 'root',
    parts: [
      cmp(CardComponent),
      dir(GogCardHeaderDirective, '[gogCardHeader]'),
      dir(GogCardMediaDirective, '[gogCardMedia]'),
      dir(GogCardFooterDirective, '[gogCardFooter]'),
      dir(GogCardLinkDirective, 'a[gogCardLink], button[gogCardLink]'),
    ],
    page: false,
  },
  {
    id: 'panel',
    name: 'Panel',
    group: 'layout',
    entry: 'root',
    parts: [
      cmp(PanelComponent),
      dir(GogPanelHeaderDirective, '[gogPanelHeader]'),
      dir(GogPanelFooterDirective, '[gogPanelFooter]'),
    ],
    page: false,
  },
  {
    id: 'accordion',
    name: 'Accordion',
    group: 'layout',
    entry: 'root',
    parts: [
      cmp(AccordionComponent),
      dir(GogAccordionHeaderDirective, '[gogAccordionHeader]'),
      dir(GogAccordionContentDirective, '[gogAccordionContent]'),
      dir(GogAccordionChevronDirective, '[gogAccordionChevron]'),
    ],
    page: false,
  },
  {
    id: 'collapsible',
    name: 'Collapsible',
    group: 'layout',
    entry: 'root',
    parts: [
      cmp(CollapsibleComponent),
      dir(GogCollapsibleTriggerDirective, '[gogCollapsibleTrigger]'),
      dir(GogCollapsibleContentDirective, '[gogCollapsibleContent]'),
    ],
    page: false,
  },
  {
    id: 'tabs',
    name: 'Tabs',
    group: 'layout',
    entry: 'root',
    parts: [
      cmp(TabsComponent),
      cmp(TabComponent),
      dir(GogTabHeaderDirective, '[gogTabHeader]'),
      dir(GogTabContentDirective, '[gogTabContent]'),
    ],
    page: false,
  },
  {
    id: 'scroll',
    name: 'Scroll',
    group: 'layout',
    entry: 'root',
    parts: [cmp(ScrollComponent)],
    page: false,
  },
  {
    id: 'paginator',
    name: 'Paginator',
    group: 'layout',
    entry: 'root',
    parts: [cmp(PaginatorComponent)],
    page: false,
  },
  {
    id: 'table',
    name: 'Table',
    group: 'layout',
    entry: 'table',
    parts: [
      cmp(TableComponent),
      dir(GogColumn, 'gog-column'),
      dir(GogColumnHeaderDirective, '[gogColumnHeader]'),
      dir(GogColumnBodyDirective, '[gogColumnBody]'),
    ],
    page: false,
  },

  // Overlays
  {
    id: 'menu',
    name: 'Menu',
    group: 'overlay',
    entry: 'root',
    parts: [
      cmp(MenuComponent),
      dir(GogMenuTriggerDirective, '[gogMenuTrigger]'),
      dir(GogMenuItemDirective, '[gogMenuItem]'),
    ],
    page: false,
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    group: 'overlay',
    entry: 'root',
    parts: [dir(GogTooltipDirective, '[gogTooltip]')],
    page: false,
  },
  {
    id: 'dialog',
    name: 'Dialog',
    group: 'overlay',
    entry: 'dialog',
    parts: [svc(DialogService), cmp(DialogComponent), cmp(ConfirmationDialogComponent)],
    page: false,
  },
  {
    id: 'toast',
    name: 'Toast',
    group: 'overlay',
    entry: 'root',
    parts: [svc(ToastService), cmp(ToastComponent), cmp(ToastContainerComponent)],
    page: false,
  },

  // Foundation
  {
    id: 'theme',
    name: 'Theme',
    group: 'foundation',
    entry: 'root',
    parts: [svc(ThemeService)],
    page: false,
  },
];
