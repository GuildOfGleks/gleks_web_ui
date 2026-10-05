import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { CHIP_EXAMPLES } from '../../../examples/chip/sources.generated';
import { ChipConfigExample } from '../../../examples/chip/chip-config/example';
import { ChipAvatarFallbackExample } from '../../../examples/chip/chip-avatar-fallback/example';
import { ChipContentExample } from '../../../examples/chip/chip-content/example';
import { ChipFilterExample } from '../../../examples/chip/chip-filter/example';
import { ChipOverviewExample } from '../../../examples/chip/chip-overview/example';
import { ChipRemovableExample } from '../../../examples/chip/chip-removable/example';
import { ChipShapesExample } from '../../../examples/chip/chip-shapes/example';
import { ChipStatesExample } from '../../../examples/chip/chip-states/example';
import { ChipWidthExample } from '../../../examples/chip/chip-width/example';

const API_INPUTS: readonly ApiRow[] = [
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
    name: 'selected',
    type: 'boolean | null',
    default: 'null',
    description:
      'Two-way. Makes the chip a filter chip: one you toggle rather than press. null is not a toggle at all and is the default, so an existing chip is untouched; false is a toggle that is off and says so with aria-pressed="false"; true is on and draws an inset ring. The chip flips it itself on click, Enter and Space.',
    since: '21.9.0',
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
    description:
      'Leading avatar image, drawn by a gog-avatar at the chip’s own size (since 21.19.0). A URL that fails falls back to the initials of avatarAlt, or to the person icon.',
  },
  {
    name: 'avatarAlt',
    type: 'string',
    default: "''",
    description:
      'Names the avatar, and gives the initials it falls back to. Empty, the avatar is decorative.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description:
      'Leading icon. Renders independently of avatarUrl — if both are set, the avatar and icon both render.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on the chip surface. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogClick',
    type: 'MouseEvent | KeyboardEvent',
    description:
      'Emitted on click, Enter, or Space, when clickable and not disabled — after the flip, for a filter chip.',
  },
  {
    name: 'gogRemove',
    type: 'void',
    description:
      'Emitted when the remove button is pressed. Stops the click from also reaching gogClick.',
  },
  {
    name: 'selectedChange',
    type: 'boolean | null',
    description: 'The flipped value of a filter chip. Comes from the selected model input.',
  },
];

@Component({
  selector: 'app-chip-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './chip-doc-page.html',
  styleUrl: './chip-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'chip')?.tokens ?? [];

  protected readonly sources = CHIP_EXAMPLES;
  protected readonly examples = {
    overview: ChipOverviewExample,
    states: ChipStatesExample,
    content: ChipContentExample,
    avatarFallback: ChipAvatarFallbackExample,
    shapes: ChipShapesExample,
    filter: ChipFilterExample,
    removable: ChipRemovableExample,
    width: ChipWidthExample,
    config: ChipConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ChipComponent],\n})\n```";
}
