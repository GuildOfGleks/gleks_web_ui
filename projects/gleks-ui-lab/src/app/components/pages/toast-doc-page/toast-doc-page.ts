import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogDropdownOption,
  InputfieldComponent,
  SelectComponent,
  ToastContainerComponent,
  ToastPosition,
  ToastService,
  ToastType,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

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
      'Drives the accent color, default icon, and aria-live politeness (assertive for error/warning, polite otherwise).',
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
    default: '4000',
    description: 'Auto-dismiss delay in ms. Ignored when isSticky is true.',
  },
  {
    name: 'position',
    type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
    default: "'bottom-right'",
    description:
      'Which corner stack this toast joins. Each corner stacks and animates independently.',
  },
  {
    name: 'dedupeKey',
    type: 'string',
    default: 'derived from message/type/icon/position/actions',
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
    ButtonComponent,
    InputfieldComponent,
    SelectComponent,
    ToastContainerComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
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

  protected readonly overviewHtml = [
    '<gog-button (gogClick)="showToast()">Preview toast</gog-button>',
    '<gog-toast-container />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, ToastContainerComponent, ToastService } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, ToastContainerComponent],',
    '  template: `',
    '    <gog-button (gogClick)="showToast()">Preview toast</gog-button>',
    '    <gog-toast-container />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    '',
    '  protected showToast(): void {',
    "    this.toastService.success('Saved successfully');",
    '  }',
    '}',
  ].join('\n');

  protected readonly configurableHtml = [
    '<gog-inputfield label="Message" [(value)]="toastMessage" />',
    '<gog-select label="Type" [options]="toastTypes" [(value)]="toastType" />',
    '<gog-select label="Position" [options]="positions" [(value)]="toastPosition" />',
    '<gog-button (gogClick)="showConfigured()">Preview toast</gog-button>',
  ].join('\n');
  protected readonly configurableTs = [
    "import { Component, inject, signal } from '@angular/core';",
    'import {',
    '  ButtonComponent,',
    '  GogDropdownOption,',
    '  InputfieldComponent,',
    '  SelectComponent,',
    '  ToastPosition,',
    '  ToastService,',
    '  ToastType,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, InputfieldComponent, SelectComponent],',
    '  template: `',
    '    <gog-inputfield label="Message" [(value)]="toastMessage" />',
    '    <gog-select label="Type" [options]="toastTypes" [(value)]="toastType" />',
    '    <gog-select label="Position" [options]="positions" [(value)]="toastPosition" />',
    '    <gog-button (gogClick)="showConfigured()">Preview toast</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    "  protected readonly toastMessage = signal('Saved successfully');",
    "  protected readonly toastType = signal<string | number | null>('success');",
    "  protected readonly toastPosition = signal<string | number | null>('bottom-right');",
    '  protected readonly toastTypes: GogDropdownOption[] = [',
    "    { id: 'success', name: 'Success' },",
    "    { id: 'error', name: 'Error' },",
    "    { id: 'warning', name: 'Warning' },",
    "    { id: 'info', name: 'Info' },",
    '  ];',
    '  protected readonly positions: GogDropdownOption[] = [',
    "    { id: 'top-left', name: 'Top left' },",
    "    { id: 'top-right', name: 'Top right' },",
    "    { id: 'bottom-left', name: 'Bottom left' },",
    "    { id: 'bottom-right', name: 'Bottom right' },",
    '  ];',
    '',
    '  protected showConfigured(): void {',
    '    this.toastService.show({',
    '      message: this.toastMessage(),',
    '      type: this.toastType() as ToastType,',
    '      position: this.toastPosition() as ToastPosition,',
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected readonly actionsHtml = [
    'this.toastService.show({',
    "  message: 'File deleted',",
    "  type: 'info',",
    '  actions: [',
    "    { label: 'Undo', iconName: 'close', onClick: () => this.restoreFile() },",
    '  ],',
    '});',
  ].join('\n');
  protected readonly actionsTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, ToastService } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button (gogClick)="showWithAction()">Delete file</gog-button>`,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    '',
    '  protected showWithAction(): void {',
    '    this.toastService.show({',
    "      message: 'File deleted',",
    "      type: 'info',",
    '      actions: [',
    "        { label: 'Undo', iconName: 'close', onClick: () => this.toastService.info('Undo clicked') },",
    '      ],',
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected readonly typesHtml = [
    "this.toastService.success('Success — saved successfully.');",
    "this.toastService.error('Error — something went wrong.');",
    "this.toastService.warning('Warning — check this before continuing.');",
    "this.toastService.info('Info — just so you know.');",
  ].join('\n');
  protected readonly typesTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, ToastService } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button (gogClick)="showOneOfEach()">Fire one of each type</gog-button>`,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    '',
    '  protected showOneOfEach(): void {',
    "    this.toastService.success('Success — saved successfully.');",
    "    this.toastService.error('Error — something went wrong.');",
    "    this.toastService.warning('Warning — check this before continuing.');",
    "    this.toastService.info('Info — just so you know.');",
    '  }',
    '}',
  ].join('\n');

  protected readonly stickyHtml = [
    'this.toastService.show({',
    "  message: 'Stays until dismissed or dismissAll() is called.',",
    "  type: 'warning',",
    '  isSticky: true,',
    '});',
    '',
    'this.toastService.show({',
    "  message: 'Auto-dismisses after 10s instead of the 4s default.',",
    "  type: 'info',",
    '  duration: 10000,',
    '});',
  ].join('\n');
  protected readonly stickyTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, ToastService } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <gog-button (gogClick)="showSticky()">Sticky toast</gog-button>',
    '    <gog-button (gogClick)="showLongDuration()">10s duration</gog-button>',
    '    <gog-button (gogClick)="dismissAll()">Dismiss all</gog-button>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    '',
    '  protected showSticky(): void {',
    '    this.toastService.show({',
    "      message: 'Stays until dismissed or dismissAll() is called.',",
    "      type: 'warning',",
    '      isSticky: true,',
    '    });',
    '  }',
    '',
    '  protected showLongDuration(): void {',
    '    this.toastService.show({',
    "      message: 'Auto-dismisses after 10s instead of the 4s default.',",
    "      type: 'info',",
    '      duration: 10000,',
    '    });',
    '  }',
    '',
    '  protected dismissAll(): void {',
    '    this.toastService.dismissAll();',
    '  }',
    '}',
  ].join('\n');

  protected readonly burstHtml = [
    'for (let index = 1; index <= 7; index += 1) {',
    "  this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });",
    '}',
  ].join('\n');
  protected readonly burstTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, ToastService } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button (gogClick)="showBurst()">Queue 7 toasts</gog-button>`,',
    '})',
    'export class ExampleComponent {',
    '  private readonly toastService = inject(ToastService);',
    '',
    '  protected showBurst(): void {',
    '    for (let index = 1; index <= 7; index += 1) {',
    "      this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });",
    '    }',
    '  }',
    '}',
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
}
