import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GogDropdownOption,
  ToastContainerComponent,
  ToastPosition,
  ToastService,
  ToastType,
} from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TOAST_EXAMPLE_SOURCES } from '../../../examples/toast/sources.generated';
import { ToastActionsExample } from '../../../examples/toast/toast-actions.example';
import { ToastBurstExample } from '../../../examples/toast/toast-burst.example';
import { ToastConfigurableExample } from '../../../examples/toast/toast-configurable.example';
import { ToastOverviewExample } from '../../../examples/toast/toast-overview.example';
import { ToastStickyExample } from '../../../examples/toast/toast-sticky.example';
import { ToastTypesExample } from '../../../examples/toast/toast-types.example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

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
  imports: [
    ExampleHostComponent,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
    ToastContainerComponent,
  ],
  providers: [provideExampleSources(TOAST_EXAMPLE_SOURCES)],
  templateUrl: './toast-doc-page.html',
  styleUrl: './toast-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDocPage {
  private readonly toastService = inject(ToastService);

  protected readonly configOptions = CONFIG_OPTIONS;
  protected readonly serviceMethods = SERVICE_METHODS;
  protected readonly containerInputs = CONTAINER_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'toast')?.tokens ?? [];

  protected readonly toastMessage = signal('Saved successfully');
  protected readonly toastType = signal<string | number | null>('success');
  protected readonly toastPosition = signal<string | number | null>('bottom-right');

  protected readonly toastTypes: GogDropdownOption[] = [
    { id: 'success', name: 'Success' },
    { id: 'error', name: 'Error' },
    { id: 'warning', name: 'Warning' },
    { id: 'info', name: 'Info' },
  ];

  protected readonly positions: GogDropdownOption[] = [
    { id: 'top-left', name: 'Top left' },
    { id: 'top-right', name: 'Top right' },
    { id: 'bottom-left', name: 'Bottom left' },
    { id: 'bottom-right', name: 'Bottom right' },
  ];

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

  protected showToast(): void {
    this.toastService.success('Saved successfully');
  }

  protected showConfigured(): void {
    this.toastService.show({
      message: this.toastMessage(),
      type: this.toastType() as ToastType,
      position: this.toastPosition() as ToastPosition,
      actions: [
        {
          label: 'Undo',
          iconName: 'close',
          onClick: () => {
            this.toastService.info('Undo clicked');
          },
        },
      ],
    });
  }

  protected showWithAction(): void {
    this.toastService.show({
      message: 'File deleted',
      type: 'info',
      actions: [
        { label: 'Undo', iconName: 'close', onClick: () => this.toastService.info('Undo clicked') },
      ],
    });
  }

  protected showOneOfEach(): void {
    this.toastService.success('Success — saved successfully.');
    this.toastService.error('Error — something went wrong.');
    this.toastService.warning('Warning — check this before continuing.');
    this.toastService.info('Info — just so you know.');
  }

  protected showSticky(): void {
    this.toastService.show({
      message: 'Stays until dismissed or dismissAll() is called.',
      type: 'warning',
      isSticky: true,
    });
  }

  protected showLongDuration(): void {
    this.toastService.show({
      message: 'Auto-dismisses after 10s instead of the 4s default.',
      type: 'info',
      duration: 10000,
    });
  }

  protected showBurst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });
    }
  }

  protected dismissAll(): void {
    this.toastService.dismissAll();
  }
  /** Each example is a file under `src/app/examples/toast/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    actions: ToastActionsExample,
    burst: ToastBurstExample,
    configurable: ToastConfigurableExample,
    overview: ToastOverviewExample,
    sticky: ToastStickyExample,
    types: ToastTypesExample,
  };
}
