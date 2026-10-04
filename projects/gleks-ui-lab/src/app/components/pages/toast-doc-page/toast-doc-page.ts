import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TOAST_EXAMPLES } from '../../../examples/toast/sources.generated';
import { ToastActionsExample } from '../../../examples/toast/toast-actions/example';
import { ToastConfigurableExample } from '../../../examples/toast/toast-configurable/example';
import { ToastContentExample } from '../../../examples/toast/toast-content/example';
import { ToastDedupeExample } from '../../../examples/toast/toast-dedupe/example';
import { ToastDurationExample } from '../../../examples/toast/toast-duration/example';
import { ToastOverviewExample } from '../../../examples/toast/toast-overview/example';
import { ToastStatesExample } from '../../../examples/toast/toast-states/example';
import { ToastTypesExample } from '../../../examples/toast/toast-types/example';

const CONFIG_OPTIONS: readonly ApiRow[] = [
  { name: 'message', type: 'string', default: 'required', description: 'The toast text.' },
  {
    name: 'type',
    type: "'success' | 'error' | 'warning' | 'info'",
    default: "'info'",
    description:
      'Drives the accent color, the default icon, and which live region announces the toast (assertive for error/warning, polite otherwise).',
  },
  {
    name: 'iconName',
    type: 'GogIconName',
    default: 'per-type default',
    description: 'Overrides the type-based default icon.',
  },
  {
    name: 'iconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Fully custom icon, taking priority over iconName.',
  },
  {
    name: 'actions',
    type: 'ToastAction[]',
    default: '[]',
    description:
      'Action buttons rendered in the toast: { label, onClick(toast), iconName?, iconTemplate? }.',
  },
  {
    name: 'isSticky',
    type: 'boolean',
    default: 'false',
    description:
      'Disables auto-dismiss entirely — the toast stays until dismissed manually or via dismissAll().',
  },
  {
    name: 'duration',
    type: 'number',
    default: 'GOG_CONFIG.toast.duration ?? 4000',
    description: 'Auto-dismiss delay in ms. Ignored when isSticky is true.',
  },
  {
    name: 'position',
    type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
    default: "GOG_CONFIG.toast.position ?? 'bottom-right'",
    description:
      'Which corner stack this toast joins. Each corner stacks and animates independently.',
  },
  {
    name: 'dedupeKey',
    type: 'string',
    default: 'derived from message/type/icon/iconTemplate/position/actions',
    description:
      "Toasts sharing a dedupe key collapse into one instance instead of stacking duplicates — calling show() again just bumps its revision and restarts the timer. Pass '' to opt a specific call out of deduping.",
  },
];

const SERVICE_METHODS: readonly ApiRow[] = [
  {
    name: 'show(config: ToastConfig): string',
    type: '',
    default: '',
    description: 'Shows a toast with full control over every option. Returns its id.',
  },
  {
    name: 'success(message, config?) / error(...) / warning(...) / info(...)',
    type: '',
    default: '',
    description: 'Shorthands for show() that set type for you; config overrides everything else.',
  },
  {
    name: 'dismiss(id: string): void',
    type: '',
    default: '',
    description: 'Dismisses a single toast by id.',
  },
  {
    name: 'dismissAll(): void',
    type: '',
    default: '',
    description: 'Dismisses every visible toast, including sticky ones.',
  },
];

const CONTAINER_INPUTS: readonly ApiRow[] = [
  {
    name: 'maxVisiblePerPosition',
    type: 'number',
    default: '5',
    description:
      'Caps how many toasts stack at once per corner; the oldest (front of queue) stay visible first.',
  },
];

@Component({
  selector: 'app-toast-doc-page',
  imports: [ApiTableComponent, DemoComponent, GlobalConfigNote, MarkdownComponent, RouterLink],
  templateUrl: './toast-doc-page.html',
  styleUrl: './toast-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDocPage {
  protected readonly configOptions = CONFIG_OPTIONS;
  protected readonly serviceMethods = SERVICE_METHODS;
  protected readonly containerInputs = CONTAINER_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'toast')?.tokens ?? [];

  protected readonly sources = TOAST_EXAMPLES;
  protected readonly examples = {
    overview: ToastOverviewExample,
    states: ToastStatesExample,
    content: ToastContentExample,
    configurable: ToastConfigurableExample,
    types: ToastTypesExample,
    duration: ToastDurationExample,
    actions: ToastActionsExample,
    dedupe: ToastDedupeExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { ToastContainerComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ToastContainerComponent],\n})\nexport class AppComponent {\n  // Mount <gog-toast-container /> once, near the root of your app.\n}\n```";

  protected readonly configSnippet = [
    '```typescript',
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'bootstrapApplication(App, {',
    '  providers: [',
    '    provideGogConfig({',
    '      toast: {',
    "        position: 'top-right',",
    '        duration: 6000,',
    '      },',
    '    }),',
    '  ],',
    '});',
    '```',
  ].join('\n');
}
