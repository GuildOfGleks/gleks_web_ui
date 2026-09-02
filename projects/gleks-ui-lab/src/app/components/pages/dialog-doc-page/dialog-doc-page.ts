import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DIALOG_DATA,
  DIALOG_REF,
  DialogRef,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface DemoDialogData {
  readonly message: string;
}

@Component({
  selector: 'app-dialog-demo-content',
  imports: [ButtonComponent],
  template: `
    <div class="dialog-demo-content">
      <p>{{ data.message }}</p>
      <gog-button variant="primary" type="button" (gogClick)="ref.close('closed-from-body')">
        Close
      </gog-button>
    </div>
  `,
  styles: [
    '.dialog-demo-content { display: flex; flex-direction: column; gap: 12px; max-width: 40ch; }',
  ],
})
class DialogDemoContentComponent {
  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string>>(DIALOG_REF);
}

@Component({
  selector: 'app-dialog-stacked-content',
  imports: [ButtonComponent],
  template: `
    <div class="dialog-demo-content">
      <p>{{ data.message }}</p>
      <gog-button variant="secondary" type="button" (gogClick)="openAnother()">
        Open another on top
      </gog-button>
      <gog-button variant="primary" type="button" (gogClick)="ref.close()">Close</gog-button>
    </div>
  `,
  styles: [
    '.dialog-demo-content { display: flex; flex-direction: column; gap: 12px; max-width: 40ch; }',
  ],
})
class DialogStackedContentComponent {
  private readonly dialogService = inject(DialogService);
  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<void>>(DIALOG_REF);
  private static depth = 0;

  protected openAnother(): void {
    DialogStackedContentComponent.depth += 1;
    this.dialogService.open({
      title: `Stacked dialog #${DialogStackedContentComponent.depth}`,
      component: DialogStackedContentComponent,
      data: { message: 'Each open() call stacks on top with an increasing z-index.' },
    });
  }
}

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const CONFIG_OPTIONS: readonly ApiRow[] = [
  {
    name: 'component',
    type: 'Type<unknown>',
    default: 'required',
    description: 'The component rendered as the dialog body.',
  },
  {
    name: 'title',
    type: 'string',
    default: 'undefined',
    description: 'Header title. The header renders if either title or closable is set.',
  },
  {
    name: 'data',
    type: 'unknown',
    default: 'undefined',
    description: 'Passed to the body component via the DIALOG_DATA injection token.',
  },
  {
    name: 'modal',
    type: 'boolean',
    default: 'true',
    description:
      'Locks body scroll, traps Tab focus inside the panel, and restores focus to the trigger on close.',
  },
  {
    name: 'closable',
    type: 'boolean',
    default: 'true',
    description: 'Shows the header close button and enables Escape/backdrop-click to close.',
  },
  {
    name: 'draggable',
    type: 'boolean',
    default: 'true',
    description:
      'Lets the header be dragged to reposition the panel. Only takes effect when a header renders.',
  },
  {
    name: 'closeIconName',
    type: 'GogIconName',
    default: "'close'",
    description: 'Icon for the header close button.',
  },
  {
    name: 'closeIconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description: 'Replaces the close button icon entirely.',
  },
  {
    name: 'width',
    type: 'string',
    default: "'auto'",
    description: 'CSS width of the panel.',
  },
  {
    name: 'maxWidth',
    type: 'string',
    default: "'90vw'",
    description: 'CSS max-width of the panel.',
  },
  {
    name: 'role',
    type: "'dialog' | 'alertdialog'",
    default: "'dialog'",
    description: "ARIA role for the panel. Use 'alertdialog' for confirmation-style prompts.",
  },
  {
    name: 'zIndex',
    type: 'number',
    default: 'auto-incrementing from 1000',
    description: 'Backdrop z-index. Dropdowns rendered inside the dialog use zIndex + 10.',
  },
];

interface ServiceRow {
  readonly signature: string;
  readonly description: string;
}

const SERVICE_METHODS: readonly ServiceRow[] = [
  {
    signature: 'open<TResult>(config: DialogConfig): DialogHandle<TResult>',
    description:
      'Opens a dialog. Returns a handle with close(result?) and an afterClosed promise that resolves once the dialog closes, with whatever value close() was called with.',
  },
  {
    signature: 'closeAll(result?: unknown): void',
    description: 'Closes every open dialog, resolving each afterClosed with the same result.',
  },
];

const INJECTION_TOKENS: readonly ServiceRow[] = [
  {
    signature: 'DIALOG_DATA: InjectionToken<unknown>',
    description: 'Inject inside the body component to read the data passed to open().',
  },
  {
    signature: 'DIALOG_REF: InjectionToken<DialogRef<unknown>>',
    description:
      'Inject inside the body component to call close(result?) and dismiss the dialog from within.',
  },
];

@Component({
  selector: 'app-dialog-doc-page',
  imports: [ButtonComponent, GlobalConfigNote, MarkdownComponent, CodeTabsComponent, RouterLink],
  templateUrl: './dialog-doc-page.html',
  styleUrl: './dialog-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDocPage {
  private readonly dialogService = inject(DialogService);

  protected readonly configOptions = CONFIG_OPTIONS;
  protected readonly serviceMethods = SERVICE_METHODS;
  protected readonly injectionTokens = INJECTION_TOKENS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'dialog')?.tokens ?? [];

  protected readonly lastResult = signal('No dialog closed yet.');

  protected readonly importSnippet =
    "```typescript\nimport { DialogComponent, DialogService } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [DialogComponent],\n})\nexport class AppComponent {\n  // Mount <gog-dialog /> once, near the root of your app.\n}\n```";

  protected readonly overviewHtml = [
    '<gog-button (gogClick)="openConfirm()">Delete workspace</gog-button>',
    '<gog-dialog />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, inject } from '@angular/core';",
    'import {',
    '  ButtonComponent,',
    '  ConfirmationDialogComponent,',
    '  DialogComponent,',
    '  DialogService,',
    '  type ConfirmDialogData,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, DialogComponent],',
    '  template: `',
    '    <gog-button (gogClick)="openConfirm()">Delete workspace</gog-button>',
    '    <gog-dialog />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly dialogService = inject(DialogService);',
    '',
    '  protected async openConfirm(): Promise<void> {',
    '    const handle = this.dialogService.open<boolean>({',
    "      title: 'Delete workspace?',",
    '      component: ConfirmationDialogComponent,',
    "      role: 'alertdialog',",
    '      data: {',
    "        title: 'Delete workspace?',",
    "        description: 'This action cannot be undone.',",
    "        confirmText: 'Delete',",
    "        cancelText: 'Cancel',",
    '      } satisfies ConfirmDialogData,',
    '    });',
    '',
    '    const confirmed = await handle.afterClosed;',
    "    console.log(confirmed ? 'Confirmed' : 'Cancelled');",
    '  }',
    '}',
  ].join('\n');

  protected readonly customContentHtml = [
    '<gog-button (gogClick)="openCustomContent()">Open custom dialog</gog-button>',
    '<gog-dialog />',
  ].join('\n');
  protected readonly customContentTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, DIALOG_DATA, DIALOG_REF, DialogComponent, DialogRef, DialogService } from '@guildofgleks/ui';",
    '',
    'interface DemoDialogData {',
    '  message: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-dialog-body',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <p>{{ data.message }}</p>',
    '    <gog-button (gogClick)="ref.close(\'closed-from-body\')">Close</gog-button>',
    '  `,',
    '})',
    'export class DialogBodyComponent {',
    '  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);',
    '  protected readonly ref = inject<DialogRef<string>>(DIALOG_REF);',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent, DialogComponent],',
    '  template: `',
    '    <gog-button (gogClick)="openCustomContent()">Open custom dialog</gog-button>',
    '    <gog-dialog />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly dialogService = inject(DialogService);',
    '',
    '  protected openCustomContent(): void {',
    '    this.dialogService.open<string>({',
    "      title: 'Custom content',",
    '      component: DialogBodyComponent,',
    "      data: { message: 'Any component can be the dialog body, with typed data passed in.' },",
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected readonly nonClosableHtml = '<gog-dialog />';
  protected readonly nonClosableTs = [
    'this.dialogService.open({',
    "  title: 'Confirm before closing',",
    '  component: DialogBodyComponent,',
    '  closable: false,',
    "  data: { message: 'No header close button, Escape and backdrop clicks are ignored. Close it from the body button.' },",
    '});',
  ].join('\n');

  protected readonly nonModalHtml = '<gog-dialog />';
  protected readonly nonModalTs = [
    'this.dialogService.open({',
    "  title: 'Non-modal',",
    '  component: DialogBodyComponent,',
    '  modal: false,',
    "  data: { message: 'Background stays scrollable and interactive, and Tab is not trapped inside the panel.' },",
    '});',
  ].join('\n');

  protected readonly widthHtml = '<gog-dialog />';
  protected readonly widthTs = [
    'this.dialogService.open({',
    "  title: 'Custom width',",
    '  component: DialogBodyComponent,',
    "  width: '520px',",
    "  data: { message: 'width and maxWidth are plain CSS values applied to the panel.' },",
    '});',
  ].join('\n');

  protected readonly stackedHtml = '<gog-dialog />';
  protected readonly stackedTs = [
    "import { Component, inject } from '@angular/core';",
    "import { ButtonComponent, DIALOG_DATA, DIALOG_REF, DialogRef, DialogService } from '@guildofgleks/ui';",
    '',
    'interface DemoDialogData {',
    '  message: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-stacked-body',",
    '  imports: [ButtonComponent],',
    '  template: `',
    '    <p>{{ data.message }}</p>',
    '    <gog-button (gogClick)="openAnother()">Open another on top</gog-button>',
    '    <gog-button (gogClick)="ref.close()">Close</gog-button>',
    '  `,',
    '})',
    'export class StackedBodyComponent {',
    '  private readonly dialogService = inject(DialogService);',
    '  protected readonly data = inject<DemoDialogData>(DIALOG_DATA);',
    '  protected readonly ref = inject<DialogRef<void>>(DIALOG_REF);',
    '',
    '  protected openAnother(): void {',
    '    this.dialogService.open({',
    "      title: 'Stacked dialog',",
    '      component: StackedBodyComponent,',
    "      data: { message: 'Each open() call stacks on top with an increasing z-index.' },",
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected async openConfirm(): Promise<void> {
    const handle = this.dialogService.open<boolean>({
      title: 'Delete workspace?',
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      data: {
        title: 'Delete workspace?',
        description: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    const confirmed = await handle.afterClosed;
    this.lastResult.set(confirmed ? 'Confirmed' : 'Cancelled');
  }

  protected async openCustomContent(): Promise<void> {
    const handle = this.dialogService.open<string>({
      title: 'Custom content',
      component: DialogDemoContentComponent,
      data: { message: 'Any component can be the dialog body, with typed data passed in.' },
    });

    const result = await handle.afterClosed;
    this.lastResult.set(result ?? 'Closed without a result');
  }

  protected async openNonClosable(): Promise<void> {
    const handle = this.dialogService.open<string>({
      title: 'Confirm before closing',
      component: DialogDemoContentComponent,
      closable: false,
      data: {
        message:
          'No header close button, Escape and backdrop clicks are ignored. Close it from the body button.',
      },
    });

    const result = await handle.afterClosed;
    this.lastResult.set(result ?? 'Closed without a result');
  }

  protected async openNonModal(): Promise<void> {
    const handle = this.dialogService.open<string>({
      title: 'Non-modal',
      component: DialogDemoContentComponent,
      modal: false,
      data: {
        message:
          'Background stays scrollable and interactive, and Tab is not trapped inside the panel.',
      },
    });

    const result = await handle.afterClosed;
    this.lastResult.set(result ?? 'Closed without a result');
  }

  protected async openCustomWidth(): Promise<void> {
    const handle = this.dialogService.open<string>({
      title: 'Custom width',
      component: DialogDemoContentComponent,
      width: '520px',
      data: { message: 'width and maxWidth are plain CSS values applied to the panel.' },
    });

    const result = await handle.afterClosed;
    this.lastResult.set(result ?? 'Closed without a result');
  }

  protected openStacked(): void {
    this.dialogService.open({
      title: 'Stacked dialog',
      component: DialogStackedContentComponent,
      data: { message: 'Each open() call stacks on top with an increasing z-index.' },
    });
  }
}
