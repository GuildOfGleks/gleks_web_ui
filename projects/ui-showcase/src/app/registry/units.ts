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
  },
  {
    id: 'textarea',
    name: 'Textarea',
    group: 'form',
    entry: 'root',
    parts: [cmp(TextareaComponent)],
  },
  {
    id: 'select',
    name: 'Select',
    group: 'form',
    entry: 'root',
    parts: [cmp(SelectComponent)],
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
  },
  {
    id: 'autocomplete',
    name: 'Autocomplete',
    group: 'form',
    entry: 'root',
    parts: [cmp(AutocompleteComponent)],
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
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    group: 'form',
    entry: 'root',
    parts: [cmp(CheckboxComponent), dir(GogCheckboxIconDirective, '[gogCheckboxIcon]')],
  },
  {
    id: 'toggle',
    name: 'Toggle',
    group: 'form',
    entry: 'root',
    parts: [cmp(ToggleComponent)],
  },
  {
    id: 'radio-group',
    name: 'Radio group',
    group: 'form',
    entry: 'root',
    parts: [cmp(RadioGroupComponent)],
  },
  {
    id: 'slider',
    name: 'Slider',
    group: 'form',
    entry: 'root',
    parts: [cmp(SliderComponent)],
  },
  {
    id: 'datepicker',
    name: 'Datepicker',
    group: 'form',
    entry: 'datepicker',
    parts: [cmp(DatepickerComponent), cmp(CalendarComponent)],
  },

  // Display & feedback
  {
    id: 'icon',
    name: 'Icon',
    group: 'display',
    entry: 'root',
    parts: [cmp(IconComponent)],
  },
  {
    id: 'badge',
    name: 'Badge',
    group: 'display',
    entry: 'root',
    parts: [dir(GogBadgeDirective, '[gogBadge]')],
  },
  {
    id: 'chip',
    name: 'Chip',
    group: 'display',
    entry: 'root',
    parts: [cmp(ChipComponent)],
  },
  {
    id: 'tag',
    name: 'Tag',
    group: 'display',
    entry: 'root',
    parts: [cmp(TagComponent), dir(GogTagIconDirective, '[gogTagIcon]')],
  },
  {
    id: 'alert',
    name: 'Alert',
    group: 'display',
    entry: 'root',
    parts: [cmp(AlertComponent), dir(GogAlertIconDirective, '[gogAlertIcon]')],
  },
  {
    id: 'spinner',
    name: 'Spinner',
    group: 'display',
    entry: 'root',
    parts: [cmp(SpinnerComponent), cmp(SpinnerOverlayComponent)],
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    group: 'display',
    entry: 'root',
    parts: [cmp(SkeletonComponent)],
  },
  {
    id: 'progressbar',
    name: 'Progressbar',
    group: 'display',
    entry: 'root',
    parts: [cmp(ProgressbarComponent)],
  },
  {
    id: 'divider',
    name: 'Divider',
    group: 'display',
    entry: 'root',
    parts: [cmp(DividerComponent)],
  },
  {
    id: 'ripple',
    name: 'Ripple',
    group: 'display',
    entry: 'root',
    parts: [dir(GogRippleDirective, '[gogRipple]')],
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
  },
  {
    id: 'scroll',
    name: 'Scroll',
    group: 'layout',
    entry: 'root',
    parts: [cmp(ScrollComponent)],
  },
  {
    id: 'paginator',
    name: 'Paginator',
    group: 'layout',
    entry: 'root',
    parts: [cmp(PaginatorComponent)],
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
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    group: 'overlay',
    entry: 'root',
    parts: [dir(GogTooltipDirective, '[gogTooltip]')],
  },
  {
    id: 'dialog',
    name: 'Dialog',
    group: 'overlay',
    entry: 'dialog',
    parts: [svc(DialogService), cmp(DialogComponent), cmp(ConfirmationDialogComponent)],
  },
  {
    id: 'toast',
    name: 'Toast',
    group: 'overlay',
    entry: 'root',
    parts: [svc(ToastService), cmp(ToastComponent), cmp(ToastContainerComponent)],
  },

  // Foundation
  {
    id: 'theme',
    name: 'Theme',
    group: 'foundation',
    entry: 'root',
    parts: [svc(ThemeService)],
  },
];
