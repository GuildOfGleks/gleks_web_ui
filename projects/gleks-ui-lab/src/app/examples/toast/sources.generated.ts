// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ToastActionsExample } from './toast-actions/example';
import { ToastBurstExample } from './toast-burst/example';
import { ToastConfigurableExample } from './toast-configurable/example';
import { ToastOverviewExample } from './toast-overview/example';
import { ToastStickyExample } from './toast-sticky/example';
import { ToastTypesExample } from './toast-types/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TOAST_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ToastActionsExample,
    {
      html: '<div class="example">\n  <gog-button (gogClick)="showWithAction()">Delete file</gog-button>\n</div>',
      ts: "import { Component, inject } from '@angular/core';\nimport { ButtonComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent],\n})\nexport class ToastActionsExample {\n  private readonly toastService = inject(ToastService);\n\n  protected showWithAction(): void {\n    this.toastService.show({\n      message: 'File deleted',\n      type: 'info',\n      actions: [\n        { label: 'Undo', iconName: 'close', onClick: () => this.toastService.info('Undo clicked') },\n      ],\n    });\n  }\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ToastBurstExample,
    {
      html: '<div class="example">\n  <gog-button (gogClick)="showBurst()">Queue 7 toasts</gog-button>\n</div>',
      ts: "import { Component, inject } from '@angular/core';\nimport { ButtonComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent],\n})\nexport class ToastBurstExample {\n  private readonly toastService = inject(ToastService);\n\n  protected showBurst(): void {\n    for (let index = 1; index <= 7; index += 1) {\n      this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });\n    }\n  }\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ToastConfigurableExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Message" [(value)]="toastMessage" />\n  <gog-select label="Type" [options]="toastTypes" [(value)]="toastType" />\n  <gog-select label="Position" [options]="positions" [(value)]="toastPosition" />\n  <gog-button (gogClick)="showConfigured()">Preview toast</gog-button>\n</div>',
      ts: "import { Component, inject, signal } from '@angular/core';\nimport {\n  ButtonComponent,\n  GogDropdownOption,\n  InputfieldComponent,\n  SelectComponent,\n  ToastPosition,\n  ToastService,\n  ToastType,\n} from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, InputfieldComponent, SelectComponent],\n})\nexport class ToastConfigurableExample {\n  private readonly toastService = inject(ToastService);\n  protected readonly toastMessage = signal('Saved successfully');\n  protected readonly toastType = signal<string | number | null>('success');\n  protected readonly toastPosition = signal<string | number | null>('bottom-right');\n  protected readonly toastTypes: GogDropdownOption[] = [\n    { id: 'success', name: 'Success' },\n    { id: 'error', name: 'Error' },\n    { id: 'warning', name: 'Warning' },\n    { id: 'info', name: 'Info' },\n  ];\n  protected readonly positions: GogDropdownOption[] = [\n    { id: 'top-left', name: 'Top left' },\n    { id: 'top-right', name: 'Top right' },\n    { id: 'bottom-left', name: 'Bottom left' },\n    { id: 'bottom-right', name: 'Bottom right' },\n  ];\n\n  protected showConfigured(): void {\n    this.toastService.show({\n      message: this.toastMessage(),\n      type: this.toastType() as ToastType,\n      position: this.toastPosition() as ToastPosition,\n    });\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    ToastOverviewExample,
    {
      html: '<div class="example">\n  <gog-button (gogClick)="showToast()">Preview toast</gog-button>\n  <!-- <gog-toast-container /> is mounted once at the root of the app, not here — see the\n       import snippet above. Mounting a second one inside a scrolling container would pin the\n       toasts to that container instead of the window. -->\n</div>',
      ts: "import { Component, inject } from '@angular/core';\nimport { ButtonComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent],\n})\nexport class ToastOverviewExample {\n  private readonly toastService = inject(ToastService);\n\n  protected showToast(): void {\n    this.toastService.success('Saved successfully');\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    ToastStickyExample,
    {
      html: '<div class="example">\n  <gog-button (gogClick)="showSticky()">Sticky toast</gog-button>\n  <gog-button (gogClick)="showLongDuration()">10s duration</gog-button>\n  <gog-button (gogClick)="dismissAll()">Dismiss all</gog-button>\n</div>',
      ts: "import { Component, inject } from '@angular/core';\nimport { ButtonComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent],\n})\nexport class ToastStickyExample {\n  private readonly toastService = inject(ToastService);\n\n  protected showSticky(): void {\n    this.toastService.show({\n      message: 'Stays until dismissed or dismissAll() is called.',\n      type: 'warning',\n      isSticky: true,\n    });\n  }\n\n  protected showLongDuration(): void {\n    this.toastService.show({\n      message: 'Auto-dismisses after 10s instead of the 4s default.',\n      type: 'info',\n      duration: 10000,\n    });\n  }\n\n  protected dismissAll(): void {\n    this.toastService.dismissAll();\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    ToastTypesExample,
    {
      html: '<div class="example">\n  <gog-button (gogClick)="showOneOfEach()">Fire one of each type</gog-button>\n</div>',
      ts: "import { Component, inject } from '@angular/core';\nimport { ButtonComponent, ToastService } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent],\n})\nexport class ToastTypesExample {\n  private readonly toastService = inject(ToastService);\n\n  protected showOneOfEach(): void {\n    this.toastService.success('Success — saved successfully.');\n    this.toastService.error('Error — something went wrong.');\n    this.toastService.warning('Warning — check this before continuing.');\n    this.toastService.info('Info — just so you know.');\n  }\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
]);
