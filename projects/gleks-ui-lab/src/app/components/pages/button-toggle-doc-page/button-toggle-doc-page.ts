import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { BUTTON_TOGGLE_EXAMPLES } from '../../../examples/button-toggle/sources.generated';
import { ButtonToggleAppearanceExample } from '../../../examples/button-toggle/button-toggle-appearance/example';
import { ButtonToggleConfigExample } from '../../../examples/button-toggle/button-toggle-config/example';
import { ButtonToggleFormsExample } from '../../../examples/button-toggle/button-toggle-forms/example';
import { ButtonToggleFullWidthExample } from '../../../examples/button-toggle/button-toggle-full-width/example';
import { ButtonToggleIconsExample } from '../../../examples/button-toggle/button-toggle-icons/example';
import { ButtonToggleMultipleExample } from '../../../examples/button-toggle/button-toggle-multiple/example';
import { ButtonToggleOverviewExample } from '../../../examples/button-toggle/button-toggle-overview/example';
import { ButtonToggleSizesExample } from '../../../examples/button-toggle/button-toggle-sizes/example';
import { ButtonToggleSlotExample } from '../../../examples/button-toggle/button-toggle-slot/example';
import { ButtonToggleStatesExample } from '../../../examples/button-toggle/button-toggle-states/example';

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'readonly TOption[]',
    default: '[]',
    description: 'The buttons. Your own objects — nothing has to be mapped into a fixed shape.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description:
      'How an option turns into its button label: a property path (dot-paths included) or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into the emitted value. Set it to null and the group emits the option object itself.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which options are non-selectable.',
  },
  {
    name: 'optionIcon',
    type: 'string | ((o: TOption) => GogIconName | null) | null',
    default: 'null',
    description: 'An optional leading icon per button.',
  },
  {
    name: 'value',
    type: 'TValue | TValue[] | null',
    default: 'null',
    description:
      'The selection: one value, or an array when multiple is on. Two-way bindable with [(value)].',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description:
      'Several buttons can be active at once. This changes the widget’s semantics, not just its behaviour — see Accessibility.',
  },
  {
    name: 'appearance',
    type: "'joined' | 'separated'",
    default: "'joined'",
    description:
      'joined is one segmented control with shared borders; separated is discrete buttons with a gap.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Which way the buttons stack.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Button padding and typography.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the whole group.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the group so its buttons share the container’s width.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description:
      'Accessible name for the group. Worth setting — the buttons alone rarely say what the group is for.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each toggle in the group. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'TValue | TValue[] | null',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogButtonToggleOption',
    type: '$implicit, selected, disabled, label',
    description:
      "Replaces one button's content. label is the resolved label, for hidden text or decoration.",
  },
  {
    name: '[gogButtonToggleOptionTypeOf]',
    type: 'readonly TOption[] — an input on gogButtonToggleOption',
    description:
      'Bind the same array as options and $implicit is typed as its element instead of unknown. Never read at runtime; left unbound, the template compiles exactly as before.',
    since: '21.15.0',
  },
];

@Component({
  selector: 'app-button-toggle-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './button-toggle-doc-page.html',
  styleUrl: './button-toggle-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button-toggle')?.tokens ?? [];

  protected readonly sources = BUTTON_TOGGLE_EXAMPLES;
  protected readonly examples = {
    overview: ButtonToggleOverviewExample,
    appearance: ButtonToggleAppearanceExample,
    sizes: ButtonToggleSizesExample,
    states: ButtonToggleStatesExample,
    icons: ButtonToggleIconsExample,
    slot: ButtonToggleSlotExample,
    fullWidth: ButtonToggleFullWidthExample,
    forms: ButtonToggleFormsExample,
    config: ButtonToggleConfigExample,
    multiple: ButtonToggleMultipleExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ButtonToggleGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonToggleGroupComponent],\n})\n```";
}
