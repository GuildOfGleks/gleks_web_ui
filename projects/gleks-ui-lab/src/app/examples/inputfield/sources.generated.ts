// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { InputfieldAddonExample } from './inputfield-addon/example';
import { InputfieldAutoWidthExample } from './inputfield-auto-width/example';
import { InputfieldClearableExample } from './inputfield-clearable/example';
import { InputfieldDisabledExample } from './inputfield-disabled/example';
import { InputfieldErrorExample } from './inputfield-error/example';
import { InputfieldFloatLabelExample } from './inputfield-float-label/example';
import { InputfieldFormExample } from './inputfield-form/example';
import { InputfieldIconsExample } from './inputfield-icons/example';
import { InputfieldNumberDateExample } from './inputfield-number-date/example';
import { InputfieldOverviewExample } from './inputfield-overview/example';
import { InputfieldPasswordExample } from './inputfield-password/example';
import { InputfieldSizesExample } from './inputfield-sizes/example';
import { InputfieldSpinButtonsExample } from './inputfield-spin-buttons/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const INPUTFIELD_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    InputfieldAddonExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Amount" [(value)]="amount">\n    <span gogInputAddonStart>$</span>\n    <span gogInputAddonEnd>USD</span>\n  </gog-inputfield>\n\n  <gog-inputfield label="Search" [(value)]="search">\n    <button type="button" gogInputAddonEnd aria-label="Clear search" (click)="clearSearch()">\n      <gog-icon name="close" />\n    </button>\n  </gog-inputfield>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport {\n  GogInputAddonEndDirective,\n  GogInputAddonStartDirective,\n  IconComponent,\n  InputfieldComponent,\n} from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [\n    InputfieldComponent,\n    GogInputAddonStartDirective,\n    GogInputAddonEndDirective,\n    IconComponent,\n  ],\n})\nexport class InputfieldAddonExample {\n  protected readonly amount = signal('');\n  protected readonly search = signal('');\n\n  // A plain method on a real button — no callback threaded through the field.\n  protected clearSearch(): void {\n    this.search.set('');\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    InputfieldAutoWidthExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Zip code" [fullWidth]="false" placeholder="00000" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldAutoWidthExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldClearableExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Search" [clearable]="true" [(value)]="search" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldClearableExample {\n  protected readonly search = signal('');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldDisabledExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Disabled" [disabled]="true" value="Read only" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldDisabledExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldErrorExample,
    {
      html: '<div class="example">\n  <gog-inputfield\n    label="Username"\n    [(value)]="value"\n    [errorMessage]="value().length > 0 && value().length < 3 ? \'At least 3 characters\' : \'\'"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldErrorExample {\n  protected readonly value = signal('');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldFloatLabelExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Email" floatLabel="on" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldFloatLabelExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldFormExample,
    {
      html: '<div class="example">\n  <gog-inputfield\n    label="Email"\n    [formControl]="emailControl"\n    errorMessage="Enter a valid email"\n    errorDisplay="auto"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent, ReactiveFormsModule],\n})\nexport class InputfieldFormExample {\n  protected readonly emailControl = new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.email],\n  });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldIconsExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Search" iconStart="info" placeholder="Decorative start icon" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldIconsExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldNumberDateExample,
    {
      html: '<div class="example">\n  <gog-inputfield\n    label="Quantity"\n    type="number"\n    [min]="1"\n    [max]="10"\n    [step]="1"\n    [formControl]="quantityControl"\n  />\n\n  <gog-inputfield label="Delivery date" type="date" [(value)]="deliveryDate" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { FormControl, ReactiveFormsModule } from '@angular/forms';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent, ReactiveFormsModule],\n})\nexport class InputfieldNumberDateExample {\n  // formControl.value is a number here (null when empty) — [(value)] would stay the raw string.\n  protected readonly quantityControl = new FormControl<number | null>(1);\n  protected readonly deliveryDate = signal('');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    InputfieldOverviewExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Name" placeholder="Ada Lovelace" [(value)]="name" />\n  <p class="readout">Value: "{{ name() }}"</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldOverviewExample {\n  protected readonly name = signal('');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    InputfieldPasswordExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Password" type="password" [(value)]="password" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldPasswordExample {\n  protected readonly password = signal('');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    InputfieldSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-inputfield [size]="sizeOption" [label]="sizeOption" [placeholder]="sizeOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSize, InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    InputfieldSpinButtonsExample,
    {
      html: '<div class="example">\n  <gog-inputfield label="Quantity (stepper)" type="number" [min]="0" [(value)]="quantity" />\n\n  <gog-inputfield\n    label="Quantity (no stepper)"\n    type="number"\n    [min]="0"\n    [showSpinButtons]="false"\n    [(value)]="quantity"\n  />\n\n  <!-- clearable and the stepper coexist: the clear button sits left of the stepper. -->\n  <gog-inputfield\n    label="Weight (clearable + stepper)"\n    type="number"\n    [min]="0"\n    [clearable]="true"\n    [(value)]="weight"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [InputfieldComponent],\n})\nexport class InputfieldSpinButtonsExample {\n  protected readonly quantity = signal('3');\n  protected readonly weight = signal('72');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 320px;\n}',
    },
  ],
]);
