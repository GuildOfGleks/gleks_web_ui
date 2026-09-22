import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  ButtonToggleGroupComponent,
  ChipComponent,
  CollapsibleComponent,
  GogAccordionItem,
  GogButtonDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  GogDropdownOption,
  GogMenuItemDirective,
  GogMenuTriggerDirective,
  MenuComponent,
  SelectComponent,
  TabComponent,
  TabsComponent,
  provideGogConfig,
} from '@guildofgleks/ui';

/**
 * Everything in this component's template reads `GOG_CONFIG` from an injector that carries
 * `provideGogConfig({ ripple: { enabled: true } })` — scoped to this subtree, so the rest of the
 * showcase stays un-rippled and the difference is visible on one page. A real app makes the same
 * call once in `app.config.ts`.
 *
 * Same shape as `global-config-scope`, and for the same reason: showing "before" and "after"
 * side by side otherwise takes two applications.
 */
@Component({
  selector: 'app-ripple-scope',
  imports: [
    AccordionComponent,
    ButtonComponent,
    ButtonToggleGroupComponent,
    ChipComponent,
    CollapsibleComponent,
    GogButtonDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    GogMenuItemDirective,
    GogMenuTriggerDirective,
    MenuComponent,
    SelectComponent,
    TabComponent,
    TabsComponent,
  ],
  providers: [provideGogConfig({ ripple: { enabled: true } })],
  templateUrl: './ripple-scope.html',
  styleUrl: './ripple-scope.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleScope {
  protected readonly density = signal('comfortable');
  protected readonly city = signal<string | null>('kyiv');

  protected readonly densities = [
    { id: 'compact', name: 'Compact' },
    { id: 'comfortable', name: 'Comfortable' },
    { id: 'spacious', name: 'Spacious' },
  ];

  protected readonly cities: GogDropdownOption[] = [
    { id: 'amsterdam', name: 'Amsterdam' },
    { id: 'berlin', name: 'Berlin' },
    { id: 'kyiv', name: 'Kyiv' },
    { id: 'lisbon', name: 'Lisbon' },
    { id: 'warsaw', name: 'Warsaw' },
  ];

  protected readonly sections: GogAccordionItem[] = [
    { id: 'shipping', title: 'Shipping' },
    { id: 'billing', title: 'Billing' },
    { id: 'returns', title: 'Returns', disabled: true },
  ];
}
