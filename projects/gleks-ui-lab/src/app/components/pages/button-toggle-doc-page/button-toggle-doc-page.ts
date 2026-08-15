import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { BUTTON_TOGGLE_EXAMPLE_SOURCES } from '../../../examples/button-toggle/sources.generated';
import { ButtonToggleAppearanceExample } from '../../../examples/button-toggle/button-toggle-appearance/example';
import { ButtonToggleIconsExample } from '../../../examples/button-toggle/button-toggle-icons/example';
import { ButtonToggleMultipleExample } from '../../../examples/button-toggle/button-toggle-multiple/example';
import { ButtonToggleOverviewExample } from '../../../examples/button-toggle/button-toggle-overview/example';
import { ButtonToggleSizesExample } from '../../../examples/button-toggle/button-toggle-sizes/example';
import { ButtonToggleSlotExample } from '../../../examples/button-toggle/button-toggle-slot/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'TOption[]',
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
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'TValue | TValue[] | null',
    default: '—',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

@Component({
  selector: 'app-button-toggle-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(BUTTON_TOGGLE_EXAMPLE_SOURCES)],
  templateUrl: './button-toggle-doc-page.html',
  styleUrl: './button-toggle-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button-toggle')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ButtonToggleGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonToggleGroupComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/button-toggle/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    overview: ButtonToggleOverviewExample,
    multiple: ButtonToggleMultipleExample,
    appearance: ButtonToggleAppearanceExample,
    icons: ButtonToggleIconsExample,
    slot: ButtonToggleSlotExample,
    sizes: ButtonToggleSizesExample,
  };
}
