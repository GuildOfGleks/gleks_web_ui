// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { RadioGroupFormsExample } from './radio-group-forms/example';
import { RadioGroupOrientationExample } from './radio-group-orientation/example';
import { RadioGroupOverviewExample } from './radio-group-overview/example';
import { RadioGroupSizesExample } from './radio-group-sizes/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const RADIO_GROUP_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    RadioGroupFormsExample,
    {
      html: '<div class="example">\n  <gog-radio-group\n    label="Shipping"\n    errorDisplay="auto"\n    errorMessage="Pick a shipping option"\n    [options]="deliveryOptions"\n    [formControl]="shipping"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { RadioGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [RadioGroupComponent, ReactiveFormsModule],\n})\nexport class RadioGroupFormsExample {\n  protected readonly deliveryOptions = [\n    { id: 'standard', label: 'Standard — 3 to 5 days' },\n    { id: 'express', label: 'Express — next day' },\n    { id: 'pickup', label: 'Collect in store' },\n    { id: 'drone', label: 'Drone drop (unavailable in your area)', disabled: true },\n  ];\n\n  protected readonly shipping = new FormControl<string | null>(null, Validators.required);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    RadioGroupOrientationExample,
    {
      html: '<div class="example">\n  <gog-radio-group\n    label="Billing"\n    orientation="horizontal"\n    [options]="planOptions"\n    [(value)]="plan"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [RadioGroupComponent],\n})\nexport class RadioGroupOrientationExample {\n  protected readonly planOptions: GogRadioOption[] = [\n    { id: 'monthly', label: 'Monthly' },\n    { id: 'yearly', label: 'Yearly' },\n  ];\n  protected readonly plan = signal<string | number | null>('yearly');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    RadioGroupOverviewExample,
    {
      html: '<div class="example">\n  <gog-radio-group label="Delivery" [options]="deliveryOptions" [(value)]="delivery" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [RadioGroupComponent],\n})\nexport class RadioGroupOverviewExample {\n  protected readonly deliveryOptions: GogRadioOption[] = [\n    { id: 'standard', label: 'Standard — 3 to 5 days' },\n    { id: 'express', label: 'Express — next day' },\n    { id: 'pickup', label: 'Collect in store' },\n    { id: 'drone', label: 'Drone drop', disabled: true },\n  ];\n  protected readonly delivery = signal<string | number | null>('standard');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    RadioGroupSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-radio-group [size]="sizeOption" [options]="planOptions" [(value)]="sizeValue" />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogSize, RadioGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [RadioGroupComponent],\n})\nexport class RadioGroupSizesExample {\n  protected readonly planOptions = [\n    { id: 'monthly', label: 'Monthly' },\n    { id: 'yearly', label: 'Yearly' },\n  ];\n\n  protected readonly sizeValue = signal<string | null>('monthly');\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
