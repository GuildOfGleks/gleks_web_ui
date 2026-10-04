import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { DIALOG_EXAMPLES } from '../../../examples/dialog/sources.generated';
import { DialogCloseIconExample } from '../../../examples/dialog/dialog-close-icon/example';
import { DialogConfigExample } from '../../../examples/dialog/dialog-config/example';
import { DialogContentExample } from '../../../examples/dialog/dialog-content/example';
import { DialogLongExample } from '../../../examples/dialog/dialog-long/example';
import { DialogOverviewExample } from '../../../examples/dialog/dialog-overview/example';
import { DialogStackExample } from '../../../examples/dialog/dialog-stack/example';
import { DialogWidthExample } from '../../../examples/dialog/dialog-width/example';

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
    description:
      "Header title, and the dialog's accessible name unless ariaLabelledBy is set. The header renders if either title or closable is set. A dialog with neither title nor ariaLabelledBy is unnamed, and dev mode warns.",
  },
  {
    name: 'ariaLabelledBy',
    type: 'string',
    default: 'undefined',
    description:
      'Id of a heading inside the body component that names the dialog; wins over title. Use it when the content shows its own heading, rather than repeating it as a title above — ConfirmationDialogComponent renders its heading with data.titleId for exactly this.',
    since: '21.15.0',
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
      'Dims the page, locks body scroll, traps Tab focus inside the panel, and restores focus to the trigger on close. false leaves the page usable: a press on it reaches the page and leaves the dialog open (since 21.15.0), which then closes by its own buttons, the close button or Escape.',
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

const SERVICE_METHODS: readonly ApiRow[] = [
  {
    name: 'open<TResult>(config: DialogConfig): DialogHandle<TResult>',
    description:
      'Opens a dialog. Returns a handle with close(result?) and an afterClosed promise that resolves once the dialog closes, with whatever value close() was called with.',
  },
  {
    name: 'closeAll(result?: unknown): void',
    description: 'Closes every open dialog, resolving each afterClosed with the same result.',
  },
];

const INJECTION_TOKENS: readonly ApiRow[] = [
  {
    name: 'DIALOG_DATA: InjectionToken<unknown>',
    description: 'Inject inside the body component to read the data passed to open().',
  },
  {
    name: 'DIALOG_REF: InjectionToken<DialogRef<unknown>>',
    description:
      'Inject inside the body component to call close(result?) and dismiss the dialog from within.',
  },
];

@Component({
  selector: 'app-dialog-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './dialog-doc-page.html',
  styleUrl: './dialog-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDocPage {
  protected readonly configOptions = CONFIG_OPTIONS;
  protected readonly serviceMethods = SERVICE_METHODS;
  protected readonly injectionTokens = INJECTION_TOKENS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'dialog')?.tokens ?? [];

  protected readonly sources = DIALOG_EXAMPLES;
  protected readonly examples = {
    overview: DialogOverviewExample,
    config: DialogConfigExample,
    content: DialogContentExample,
    width: DialogWidthExample,
    long: DialogLongExample,
    closeIcon: DialogCloseIconExample,
    stack: DialogStackExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { DialogComponent, DialogService } from '@guildofgleks/ui/dialog';\n\n@Component({\n  // ...\n  imports: [DialogComponent],\n})\nexport class AppComponent {\n  // Mount <gog-dialog /> once, near the root of your app.\n}\n```";
}
