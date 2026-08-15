// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { TextareaAutoWidthExample } from './textarea-auto-width/example';
import { TextareaClearableExample } from './textarea-clearable/example';
import { TextareaDisabledExample } from './textarea-disabled/example';
import { TextareaErrorExample } from './textarea-error/example';
import { TextareaFloatLabelExample } from './textarea-float-label/example';
import { TextareaFormExample } from './textarea-form/example';
import { TextareaOverviewExample } from './textarea-overview/example';
import { TextareaResizeExample } from './textarea-resize/example';
import { TextareaRowsExample } from './textarea-rows/example';
import { TextareaSizesExample } from './textarea-sizes/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TEXTAREA_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    TextareaAutoWidthExample,
    {
      html: '<div class="example">\n  <gog-textarea label="Default — fills its container" [rows]="2" />\n  <gog-textarea label="fullWidth false" [fullWidth]="false" [rows]="2" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaAutoWidthExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 16px;\n  max-width: 420px;\n}\n/* The first one has to stretch for "fills its container" to mean anything, while the\n   second must be left to size itself. */\ngog-textarea:first-of-type {\n  align-self: stretch;\n}',
    },
  ],
  [
    TextareaClearableExample,
    {
      html: '<div class="example">\n  <gog-textarea label="Notes" [clearable]="true" [(value)]="notes" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaClearableExample {\n  protected readonly notes = signal('');\n}",
      css: '.example {\n  display: block;\n  max-width: 420px;\n}',
    },
  ],
  [
    TextareaDisabledExample,
    {
      html: '<div class="example">\n  <gog-textarea label="Disabled" [disabled]="true" value="Read only" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaDisabledExample {}",
      css: '.example {\n  display: block;\n  max-width: 420px;\n}',
    },
  ],
  [
    TextareaErrorExample,
    {
      html: '<div class="example">\n  <gog-textarea\n    label="Feedback"\n    [(value)]="value"\n    [errorMessage]="value().length > 0 && value().length < 10 ? \'At least 10 characters\' : \'\'"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaErrorExample {\n  protected readonly value = signal('');\n}",
      css: '.example {\n  display: block;\n  max-width: 420px;\n}',
    },
  ],
  [
    TextareaFloatLabelExample,
    {
      html: '<div class="example">\n  <gog-textarea label="in" floatLabel="in" [rows]="2" />\n  <gog-textarea label="on" floatLabel="on" [rows]="2" />\n  <gog-textarea label="over" floatLabel="over" [rows]="2" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaFloatLabelExample {}",
      css: ".example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  /* 'over' floats the label fully above the border, so the rows need room between them\n     or it lands on the field above. */\n  gap: 24px;\n  max-width: 420px;\n}",
    },
  ],
  [
    TextareaFormExample,
    {
      html: '<div class="example">\n  <gog-textarea\n    label="Comment"\n    [formControl]="commentControl"\n    errorMessage="At least 10 characters"\n    errorDisplay="auto"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent, ReactiveFormsModule],\n})\nexport class TextareaFormExample {\n  protected readonly commentControl = new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.minLength(10)],\n  });\n}",
      css: '.example {\n  display: block;\n  max-width: 420px;\n}',
    },
  ],
  [
    TextareaOverviewExample,
    {
      html: '<div class="example">\n  <gog-textarea label="Bio" placeholder="Tell us about yourself" [(value)]="bio" />\n  <p class="readout">Value: "{{ bio() }}"</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaOverviewExample {\n  protected readonly bio = signal('');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    TextareaResizeExample,
    {
      html: '<div class="example">\n  <gog-textarea label="vertical (default)" resize="vertical" [rows]="3" />\n  <gog-textarea label="horizontal" resize="horizontal" [rows]="3" />\n  <gog-textarea label="both" resize="both" [rows]="3" />\n  <gog-textarea label="none" resize="none" [rows]="3" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaResizeExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n  /* Narrower than the card on purpose: the horizontal and both handles drag the field\n     wider, and there has to be somewhere for it to go. */\n  max-width: 340px;\n}',
    },
  ],
  [
    TextareaRowsExample,
    {
      html: '<div class="example">\n  <gog-textarea label="Notes" [rows]="8" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaRowsExample {}",
      css: '.example {\n  display: block;\n  max-width: 420px;\n}',
    },
  ],
  [
    TextareaSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-textarea [size]="sizeOption" [label]="sizeOption" [rows]="2" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSize, TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TextareaComponent],\n})\nexport class TextareaSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
