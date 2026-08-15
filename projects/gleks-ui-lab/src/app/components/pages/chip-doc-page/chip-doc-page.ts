import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize, GogTagShape } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { CHIP_EXAMPLE_SOURCES } from '../../../examples/chip/sources.generated';
import { ChipAvatarExample } from '../../../examples/chip/chip-avatar/example';
import { ChipDisabledExample } from '../../../examples/chip/chip-disabled/example';
import { ChipFullWidthExample } from '../../../examples/chip/chip-full-width/example';
import { ChipIconExample } from '../../../examples/chip/chip-icon/example';
import { ChipNonInteractiveExample } from '../../../examples/chip/chip-non-interactive/example';
import { ChipOverviewExample } from '../../../examples/chip/chip-overview/example';
import { ChipRemovableExample } from '../../../examples/chip/chip-removable/example';
import { ChipShapesExample } from '../../../examples/chip/chip-shapes/example';
import { ChipSizesExample } from '../../../examples/chip/chip-sizes/example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Font size, padding, gap, and avatar/icon size.',
  },
  {
    name: 'shape',
    type: "'rounded' | 'pill'",
    default: "'rounded'",
    description: 'Corner radius style.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Blocks click/keyboard activation and hides the remove button, regardless of removable.',
  },
  {
    name: 'clickable',
    type: 'boolean',
    default: 'true',
    description:
      'Whether the chip responds to click/Enter/Space and exposes role="button". Set false for a static, non-interactive label.',
  },
  {
    name: 'removable',
    type: 'boolean',
    default: 'false',
    description: 'Shows a trailing remove (×) button that emits gogRemove.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the chip to fill its container.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description: 'Accessible name for the chip surface.',
  },
  {
    name: 'removeAriaLabel',
    type: 'string',
    default: "'Remove chip'",
    description: 'Accessible name for the remove button.',
  },
  {
    name: 'avatarUrl',
    type: 'string | null',
    default: 'null',
    description: 'Leading avatar image URL.',
  },
  {
    name: 'avatarAlt',
    type: 'string',
    default: "''",
    description: 'Alt text for the avatar image.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description:
      'Leading icon. Renders independently of avatarUrl — if both are set, the avatar and icon both render.',
  },
];

interface ApiOutputRow {
  readonly name: string;
  readonly type: string;
  readonly description: string;
}

const API_OUTPUTS: readonly ApiOutputRow[] = [
  {
    name: 'gogClick',
    type: 'EventEmitter<MouseEvent | KeyboardEvent>',
    description: 'Emitted on click, Enter, or Space, when clickable and not disabled.',
  },
  {
    name: 'gogRemove',
    type: 'EventEmitter<void>',
    description:
      'Emitted when the remove button is pressed. Stops the click from also reaching gogClick.',
  },
];

@Component({
  selector: 'app-chip-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(CHIP_EXAMPLE_SOURCES)],
  templateUrl: './chip-doc-page.html',
  styleUrl: './chip-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'chip')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ChipComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/chip/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    avatar: ChipAvatarExample,
    disabled: ChipDisabledExample,
    fullWidth: ChipFullWidthExample,
    icon: ChipIconExample,
    nonInteractive: ChipNonInteractiveExample,
    overview: ChipOverviewExample,
    removable: ChipRemovableExample,
    shapes: ChipShapesExample,
    sizes: ChipSizesExample,
  };
}
