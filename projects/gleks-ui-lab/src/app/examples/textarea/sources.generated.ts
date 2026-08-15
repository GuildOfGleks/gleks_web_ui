// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { TextareaAutoWidthExample } from './textarea-auto-width.example';
import { TextareaClearableExample } from './textarea-clearable.example';
import { TextareaDisabledExample } from './textarea-disabled.example';
import { TextareaErrorExample } from './textarea-error.example';
import { TextareaFloatLabelExample } from './textarea-float-label.example';
import { TextareaFormExample } from './textarea-form.example';
import { TextareaOverviewExample } from './textarea-overview.example';
import { TextareaResizeExample } from './textarea-resize.example';
import { TextareaRowsExample } from './textarea-rows.example';
import { TextareaSizesExample } from './textarea-sizes.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const TEXTAREA_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    TextareaAutoWidthExample,
    'import { Component } from \'@angular/core\';\nimport { TextareaComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TextareaComponent],\n  template: `<gog-textarea label="Short note" [fullWidth]="false" [rows]="2" />`,\n})\nexport class TextareaAutoWidthExample {}',
  ],
  [
    TextareaClearableExample,
    "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent],\n  template: `<gog-textarea label=\"Notes\" [clearable]=\"true\" [(value)]=\"notes\" />`,\n})\nexport class TextareaClearableExample {\n  protected readonly notes = signal('');\n}",
  ],
  [
    TextareaDisabledExample,
    'import { Component } from \'@angular/core\';\nimport { TextareaComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TextareaComponent],\n  template: `<gog-textarea label="Disabled" [disabled]="true" value="Read only" />`,\n})\nexport class TextareaDisabledExample {}',
  ],
  [
    TextareaErrorExample,
    "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent],\n  template: `\n    <gog-textarea\n      label=\"Feedback\"\n      [(value)]=\"value\"\n      [errorMessage]=\"value().length > 0 && value().length < 10 ? 'At least 10 characters' : ''\"\n    />\n  `,\n})\nexport class TextareaErrorExample {\n  protected readonly value = signal('');\n}",
  ],
  [
    TextareaFloatLabelExample,
    'import { Component } from \'@angular/core\';\nimport { TextareaComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TextareaComponent],\n  template: ` <gog-textarea label="Message" floatLabel="on" [rows]="2" /> `,\n})\nexport class TextareaFloatLabelExample {}',
  ],
  [
    TextareaFormExample,
    "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent, ReactiveFormsModule],\n  template: `\n    <gog-textarea\n      label=\"Comment\"\n      [formControl]=\"commentControl\"\n      errorMessage=\"At least 10 characters\"\n      errorDisplay=\"auto\"\n    />\n  `,\n})\nexport class TextareaFormExample {\n  protected readonly commentControl = new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.minLength(10)],\n  });\n}",
  ],
  [
    TextareaOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent],\n  template: `<gog-textarea label=\"Bio\" placeholder=\"Tell us about yourself\" [(value)]=\"bio\" />`,\n})\nexport class TextareaOverviewExample {\n  protected readonly bio = signal('');\n}",
  ],
  [
    TextareaResizeExample,
    'import { Component } from \'@angular/core\';\nimport { TextareaComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [TextareaComponent],\n  template: `\n    <gog-textarea label="Both axes" resize="both" [rows]="3" />\n    <gog-textarea label="Fixed size" resize="none" [rows]="3" />\n  `,\n})\nexport class TextareaResizeExample {}',
  ],
  [
    TextareaRowsExample,
    "import { Component } from '@angular/core';\nimport { TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent],\n  template: `<gog-textarea label=\"Notes\" [rows]=\"8\" />`,\n})\nexport class TextareaRowsExample {}",
  ],
  [
    TextareaSizesExample,
    "import { Component } from '@angular/core';\nimport { GogSize, TextareaComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [TextareaComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-textarea [size]=\"sizeOption\" [label]=\"sizeOption\" [rows]=\"2\" />\n    }\n  `,\n})\nexport class TextareaSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
]);
