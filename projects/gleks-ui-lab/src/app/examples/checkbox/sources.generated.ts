// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { CheckboxCheckIconExample } from './checkbox-check-icon/example';
import { CheckboxDisabledExample } from './checkbox-disabled/example';
import { CheckboxFormExample } from './checkbox-form/example';
import { CheckboxFullWidthExample } from './checkbox-full-width/example';
import { CheckboxIndeterminateExample } from './checkbox-indeterminate/example';
import { CheckboxNoLabelExample } from './checkbox-no-label/example';
import { CheckboxOverviewExample } from './checkbox-overview/example';
import { CheckboxSizesExample } from './checkbox-sizes/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const CHECKBOX_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    CheckboxCheckIconExample,
    {
      html: '<div class="example">\n  <gog-checkbox label="Custom mark" [checked]="true">\n    <ng-template gogCheckboxIcon>\n      <gog-icon name="close" />\n    </ng-template>\n  </gog-checkbox>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CheckboxComponent, GogCheckboxIconDirective, IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],\n})\nexport class CheckboxCheckIconExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    CheckboxDisabledExample,
    {
      html: '<div class="example">\n  <gog-checkbox label="Disabled, unchecked" [disabled]="true" />\n  <gog-checkbox label="Disabled, checked" [checked]="true" [disabled]="true" />\n  <gog-checkbox label="Disabled, indeterminate" [indeterminate]="true" [disabled]="true" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxDisabledExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    CheckboxFormExample,
    {
      html: '<div class="example">\n  <gog-checkbox label="Subscribe" [formControl]="control" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule } from '@angular/forms';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent, ReactiveFormsModule],\n})\nexport class CheckboxFormExample {\n  protected readonly control = new FormControl(false, { nonNullable: true });\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CheckboxFullWidthExample,
    {
      html: '<div class="example">\n  <gog-checkbox label="Full width row" [fullWidth]="true" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxFullWidthExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CheckboxIndeterminateExample,
    {
      html: '<div class="example">\n  <gog-checkbox\n    label="Select all"\n    [checked]="allChecked()"\n    [indeterminate]="someChecked() && !allChecked()"\n    (checkedChange)="setAll($event)"\n  />\n\n  @for (item of subscriptions(); track item.id) {\n    <gog-checkbox\n      [label]="item.label"\n      [checked]="item.checked"\n      (checkedChange)="setOne(item.id, $event)"\n    />\n  }\n</div>',
      ts: "import { Component, computed, signal } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\ninterface Subscription {\n  id: string;\n  label: string;\n  checked: boolean;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxIndeterminateExample {\n  protected readonly subscriptions = signal<Subscription[]>([\n    { id: 'news', label: 'Newsletter', checked: true },\n    { id: 'offers', label: 'Special offers', checked: false },\n  ]);\n  protected readonly allChecked = computed(() =>\n    this.subscriptions().every((item) => item.checked),\n  );\n  protected readonly someChecked = computed(() =>\n    this.subscriptions().some((item) => item.checked),\n  );\n\n  protected setAll(checked: boolean): void {\n    this.subscriptions.update((items) => items.map((item) => ({ ...item, checked })));\n  }\n\n  protected setOne(id: string, checked: boolean): void {\n    this.subscriptions.update((items) =>\n      items.map((item) => (item.id === id ? { ...item, checked } : item)),\n    );\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    CheckboxNoLabelExample,
    {
      html: '<div class="example">\n  <gog-checkbox ariaLabel="Select row" [(checked)]="agreed" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxNoLabelExample {\n  protected readonly agreed = signal(false);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CheckboxOverviewExample,
    {
      html: '<div class="example">\n  <gog-checkbox label="I agree" [(checked)]="agreed" />\n  <p class="readout">Checked: {{ agreed() }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxOverviewExample {\n  protected readonly agreed = signal(false);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    CheckboxSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-checkbox [size]="sizeOption" [label]="sizeOption" [checked]="true" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CheckboxComponent, GogSize } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CheckboxComponent],\n})\nexport class CheckboxSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
