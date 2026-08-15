// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { InputfieldAddonExample } from './inputfield-addon.example';
import { InputfieldAutoWidthExample } from './inputfield-auto-width.example';
import { InputfieldClearableExample } from './inputfield-clearable.example';
import { InputfieldDisabledExample } from './inputfield-disabled.example';
import { InputfieldErrorExample } from './inputfield-error.example';
import { InputfieldFloatLabelExample } from './inputfield-float-label.example';
import { InputfieldFormExample } from './inputfield-form.example';
import { InputfieldIconsExample } from './inputfield-icons.example';
import { InputfieldNumberDateExample } from './inputfield-number-date.example';
import { InputfieldOverviewExample } from './inputfield-overview.example';
import { InputfieldPasswordExample } from './inputfield-password.example';
import { InputfieldSizesExample } from './inputfield-sizes.example';
import { InputfieldSpinButtonsExample } from './inputfield-spin-buttons.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const INPUTFIELD_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    InputfieldAddonExample,
    'import { Component, signal } from \'@angular/core\';\nimport {\n  GogInputAddonEndDirective,\n  GogInputAddonStartDirective,\n  IconComponent,\n  InputfieldComponent,\n} from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [\n    InputfieldComponent,\n    GogInputAddonStartDirective,\n    GogInputAddonEndDirective,\n    IconComponent,\n  ],\n  template: `\n    <gog-inputfield label="Amount" [(value)]="amount">\n      <span gogInputAddonStart>$</span>\n      <span gogInputAddonEnd>USD</span>\n    </gog-inputfield>\n\n    <gog-inputfield label="Search" [(value)]="search">\n      <button type="button" gogInputAddonEnd aria-label="Clear search" (click)="clearSearch()">\n        <gog-icon name="close" />\n      </button>\n    </gog-inputfield>\n  `,\n})\nexport class InputfieldAddonExample {\n  protected readonly amount = signal(\'\');\n  protected readonly search = signal(\'\');\n\n  // A plain method on a real button — no callback threaded through the field.\n  protected clearSearch(): void {\n    this.search.set(\'\');\n  }\n}',
  ],
  [
    InputfieldAutoWidthExample,
    'import { Component } from \'@angular/core\';\nimport { InputfieldComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label="Zip code" [fullWidth]="false" placeholder="00000" />`,\n})\nexport class InputfieldAutoWidthExample {}',
  ],
  [
    InputfieldClearableExample,
    "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label=\"Search\" [clearable]=\"true\" [(value)]=\"search\" />`,\n})\nexport class InputfieldClearableExample {\n  protected readonly search = signal('');\n}",
  ],
  [
    InputfieldDisabledExample,
    'import { Component } from \'@angular/core\';\nimport { InputfieldComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label="Disabled" [disabled]="true" value="Read only" />`,\n})\nexport class InputfieldDisabledExample {}',
  ],
  [
    InputfieldErrorExample,
    "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `\n    <gog-inputfield\n      label=\"Username\"\n      [(value)]=\"value\"\n      [errorMessage]=\"value().length > 0 && value().length < 3 ? 'At least 3 characters' : ''\"\n    />\n  `,\n})\nexport class InputfieldErrorExample {\n  protected readonly value = signal('');\n}",
  ],
  [
    InputfieldFloatLabelExample,
    "import { Component } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label=\"Email\" floatLabel=\"on\" />`,\n})\nexport class InputfieldFloatLabelExample {}",
  ],
  [
    InputfieldFormExample,
    "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent, ReactiveFormsModule],\n  template: `\n    <gog-inputfield\n      label=\"Email\"\n      [formControl]=\"emailControl\"\n      errorMessage=\"Enter a valid email\"\n      errorDisplay=\"auto\"\n    />\n  `,\n})\nexport class InputfieldFormExample {\n  protected readonly emailControl = new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.email],\n  });\n}",
  ],
  [
    InputfieldIconsExample,
    'import { Component } from \'@angular/core\';\nimport { InputfieldComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [InputfieldComponent],\n  template: `\n    <gog-inputfield label="Search" iconStart="info" placeholder="Decorative start icon" />\n  `,\n})\nexport class InputfieldIconsExample {}',
  ],
  [
    InputfieldNumberDateExample,
    'import { Component, signal } from \'@angular/core\';\nimport { FormControl, ReactiveFormsModule } from \'@angular/forms\';\nimport { InputfieldComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [InputfieldComponent, ReactiveFormsModule],\n  template: `\n    <gog-inputfield\n      label="Quantity"\n      type="number"\n      [min]="1"\n      [max]="10"\n      [step]="1"\n      [formControl]="quantityControl"\n    />\n\n    <gog-inputfield label="Delivery date" type="date" [(value)]="deliveryDate" />\n  `,\n})\nexport class InputfieldNumberDateExample {\n  // formControl.value is a number here (null when empty) — [(value)] would stay the raw string.\n  protected readonly quantityControl = new FormControl<number | null>(1);\n  protected readonly deliveryDate = signal(\'\');\n}',
  ],
  [
    InputfieldOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label=\"Name\" placeholder=\"Ada Lovelace\" [(value)]=\"name\" />`,\n})\nexport class InputfieldOverviewExample {\n  protected readonly name = signal('');\n}",
  ],
  [
    InputfieldPasswordExample,
    "import { Component, signal } from '@angular/core';\nimport { InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `<gog-inputfield label=\"Password\" type=\"password\" [(value)]=\"password\" />`,\n})\nexport class InputfieldPasswordExample {\n  protected readonly password = signal('');\n}",
  ],
  [
    InputfieldSizesExample,
    "import { Component } from '@angular/core';\nimport { GogSize, InputfieldComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [InputfieldComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-inputfield [size]=\"sizeOption\" [label]=\"sizeOption\" [placeholder]=\"sizeOption\" />\n    }\n  `,\n})\nexport class InputfieldSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
  [
    InputfieldSpinButtonsExample,
    'import { Component, signal } from \'@angular/core\';\nimport { InputfieldComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [InputfieldComponent],\n  template: `\n    <gog-inputfield label="Quantity (stepper)" type="number" [min]="0" [(value)]="quantity" />\n\n    <gog-inputfield\n      label="Quantity (no stepper)"\n      type="number"\n      [min]="0"\n      [showSpinButtons]="false"\n      [(value)]="quantity"\n    />\n\n    <!-- clearable and the stepper coexist: the clear button sits left of the stepper. -->\n    <gog-inputfield\n      label="Weight (clearable + stepper)"\n      type="number"\n      [min]="0"\n      [clearable]="true"\n      [(value)]="weight"\n    />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      gap: 12px;\n      max-width: 320px;\n    }\n  `,\n})\nexport class InputfieldSpinButtonsExample {\n  protected readonly quantity = signal(\'3\');\n  protected readonly weight = signal(\'72\');\n}',
  ],
]);
