import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoComponent } from '../../shared/demo/demo';
import { LIBRARY_VERSION } from '../../shared/library-version';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { MENU_EXAMPLES } from '../../../examples/menu/sources.generated';
import { MenuDirectionExample } from '../../../examples/menu/menu-direction/example';
import { MenuDisabledExample } from '../../../examples/menu/menu-disabled/example';
import { MenuLongExample } from '../../../examples/menu/menu-long/example';
import { MenuOverviewExample } from '../../../examples/menu/menu-overview/example';
import { MenuRowActionsExample } from '../../../examples/menu/menu-row-actions/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'direction',
    type: "'auto' | 'up' | 'down'",
    default: "'auto'",
    description:
      "'auto' drops the panel down whenever it fits and flips it up only when it cannot — unlike a dropdown's listbox, which takes whichever side has more room.",
    since: '21.5.0',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description:
      'Names the panel itself, announced when the menu opens. The trigger keeps its own accessible name — usually an aria-label, since a row-actions trigger is an icon button with no text.',
    since: '21.5.0',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each gogMenuItem. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const API_OUTPUTS: readonly { name: string; payload: string; description: string }[] = [
  {
    name: 'gogClosed',
    payload: 'void',
    description:
      'Fires after every close, whatever caused it — an item, Escape, Tab, or a click outside.',
  },
];

const API_METHODS: readonly { name: string; description: string }[] = [
  {
    name: "open(trigger: HTMLElement, focus?: 'first' | 'last')",
    description: 'Opens anchored to that element, focusing the first item — or the last.',
  },
  {
    name: 'close(restoreFocus = true)',
    description: 'Closes and, unless told otherwise, returns focus to the trigger.',
  },
  { name: 'toggle(trigger: HTMLElement)', description: 'What the trigger directive calls.' },
  {
    name: 'isOpenFrom(trigger: HTMLElement)',
    description: 'True while that element is the one the menu is currently open from.',
  },
  { name: 'isOpen', description: 'A signal, true while the panel is rendered.' },
];

const KEYBOARD: readonly { keys: string; action: string }[] = [
  { keys: 'Enter / Space / ArrowDown', action: 'Opens the menu with the first item focused.' },
  { keys: 'ArrowUp', action: 'Opens the menu with the last item focused.' },
  {
    keys: 'ArrowDown / ArrowUp',
    action: 'Moves between items and wraps at the ends. Disabled items are stepped over.',
  },
  { keys: 'Home / End', action: 'Jumps to the first / last item that is not disabled.' },
  { keys: 'Escape', action: 'Closes and returns focus to the trigger.' },
  { keys: 'Tab', action: 'Closes and lets focus move on to the next element in the page.' },
];

@Component({
  selector: 'app-menu-doc-page',
  imports: [DemoComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './menu-doc-page.html',
  styleUrl: './menu-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiMethods = API_METHODS;
  protected readonly keyboard = KEYBOARD;
  protected readonly libraryVersion = LIBRARY_VERSION;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'menu')?.tokens ?? [];

  protected readonly importSnippet = [
    '```typescript',
    'import {',
    '  MenuComponent,',
    '  GogMenuTriggerDirective,',
    '  GogMenuItemDirective,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [MenuComponent, GogMenuTriggerDirective, GogMenuItemDirective],',
    '})',
    '```',
  ].join('\n');

  protected readonly sources = MENU_EXAMPLES;
  protected readonly examples = {
    overview: MenuOverviewExample,
    disabled: MenuDisabledExample,
    long: MenuLongExample,
    rowActions: MenuRowActionsExample,
    direction: MenuDirectionExample,
  };
}
