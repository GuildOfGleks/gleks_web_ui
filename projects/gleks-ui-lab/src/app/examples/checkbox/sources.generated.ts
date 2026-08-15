// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { CheckboxCheckIconExample } from './checkbox-check-icon.example';
import { CheckboxDisabledExample } from './checkbox-disabled.example';
import { CheckboxFormExample } from './checkbox-form.example';
import { CheckboxFullWidthExample } from './checkbox-full-width.example';
import { CheckboxIndeterminateExample } from './checkbox-indeterminate.example';
import { CheckboxNoLabelExample } from './checkbox-no-label.example';
import { CheckboxOverviewExample } from './checkbox-overview.example';
import { CheckboxSizesExample } from './checkbox-sizes.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const CHECKBOX_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    CheckboxCheckIconExample,
    'import { Component } from \'@angular/core\';\nimport { CheckboxComponent, GogCheckboxIconDirective, IconComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],\n  template: `\n    <gog-checkbox label="Custom mark" [checked]="true">\n      <ng-template gogCheckboxIcon>\n        <gog-icon name="close" />\n      </ng-template>\n    </gog-checkbox>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 12px;\n      max-width: 420px;\n    }\n  `,\n})\nexport class CheckboxCheckIconExample {}',
  ],
  [
    CheckboxDisabledExample,
    'import { Component } from \'@angular/core\';\nimport { CheckboxComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [CheckboxComponent],\n  template: `\n    <gog-checkbox label="Disabled, unchecked" [disabled]="true" />\n    <gog-checkbox label="Disabled, checked" [checked]="true" [disabled]="true" />\n    <gog-checkbox label="Disabled, indeterminate" [indeterminate]="true" [disabled]="true" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 12px;\n      max-width: 420px;\n    }\n  `,\n})\nexport class CheckboxDisabledExample {}',
  ],
  [
    CheckboxFormExample,
    "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule } from '@angular/forms';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CheckboxComponent, ReactiveFormsModule],\n  template: `<gog-checkbox label=\"Subscribe\" [formControl]=\"control\" />`,\n})\nexport class CheckboxFormExample {\n  protected readonly control = new FormControl(false, { nonNullable: true });\n}",
  ],
  [
    CheckboxFullWidthExample,
    "import { Component } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CheckboxComponent],\n  template: `<gog-checkbox label=\"Full width row\" [fullWidth]=\"true\" />`,\n})\nexport class CheckboxFullWidthExample {}",
  ],
  [
    CheckboxIndeterminateExample,
    'import { Component, computed, signal } from \'@angular/core\';\nimport { CheckboxComponent } from \'@guildofgleks/ui\';\n\ninterface Subscription {\n  id: string;\n  label: string;\n  checked: boolean;\n}\n\n@Component({\n  selector: \'app-example\',\n  imports: [CheckboxComponent],\n  template: `\n    <gog-checkbox\n      label="Select all"\n      [checked]="allChecked()"\n      [indeterminate]="someChecked() && !allChecked()"\n      (checkedChange)="setAll($event)"\n    />\n\n    @for (item of subscriptions(); track item.id) {\n      <gog-checkbox\n        [label]="item.label"\n        [checked]="item.checked"\n        (checkedChange)="setOne(item.id, $event)"\n      />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 12px;\n      max-width: 420px;\n    }\n  `,\n})\nexport class CheckboxIndeterminateExample {\n  protected readonly subscriptions = signal<Subscription[]>([\n    { id: \'news\', label: \'Newsletter\', checked: true },\n    { id: \'offers\', label: \'Special offers\', checked: false },\n  ]);\n  protected readonly allChecked = computed(() =>\n    this.subscriptions().every((item) => item.checked),\n  );\n  protected readonly someChecked = computed(() =>\n    this.subscriptions().some((item) => item.checked),\n  );\n\n  protected setAll(checked: boolean): void {\n    this.subscriptions.update((items) => items.map((item) => ({ ...item, checked })));\n  }\n\n  protected setOne(id: string, checked: boolean): void {\n    this.subscriptions.update((items) =>\n      items.map((item) => (item.id === id ? { ...item, checked } : item)),\n    );\n  }\n}',
  ],
  [
    CheckboxNoLabelExample,
    "import { Component, signal } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CheckboxComponent],\n  template: `<gog-checkbox ariaLabel=\"Select row\" [(checked)]=\"agreed\" />`,\n})\nexport class CheckboxNoLabelExample {\n  protected readonly agreed = signal(false);\n}",
  ],
  [
    CheckboxOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { CheckboxComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CheckboxComponent],\n  template: `<gog-checkbox label=\"I agree\" [(checked)]=\"agreed\" />`,\n})\nexport class CheckboxOverviewExample {\n  protected readonly agreed = signal(false);\n}",
  ],
  [
    CheckboxSizesExample,
    "import { Component } from '@angular/core';\nimport { CheckboxComponent, GogSize } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CheckboxComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-checkbox [size]=\"sizeOption\" [label]=\"sizeOption\" [checked]=\"true\" />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 12px;\n      max-width: 420px;\n    }\n  `,\n})\nexport class CheckboxSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
]);
