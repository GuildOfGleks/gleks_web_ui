// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { ToggleDisabledExample } from './toggle-disabled.example';
import { ToggleFormsExample } from './toggle-forms.example';
import { ToggleLayoutExample } from './toggle-layout.example';
import { ToggleOverviewExample } from './toggle-overview.example';
import { ToggleSizesExample } from './toggle-sizes.example';
import { ToggleTrackLabelsExample } from './toggle-track-labels.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const TOGGLE_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    ToggleDisabledExample,
    'import { Component } from \'@angular/core\';\nimport { ToggleComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ToggleComponent],\n  template: `\n    <gog-toggle label="Disabled, off" [disabled]="true" />\n    <gog-toggle label="Disabled, on" [disabled]="true" [checked]="true" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      gap: 12px;\n    }\n  `,\n})\nexport class ToggleDisabledExample {}',
  ],
  [
    ToggleFormsExample,
    "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule } from '@angular/forms';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ToggleComponent, ReactiveFormsModule],\n  template: `\n    <gog-toggle label=\"Dark mode\" [formControl]=\"darkMode\" />\n    <p>Control value: {{ darkMode.value }}</p>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      gap: 12px;\n    }\n  `,\n})\nexport class ToggleFormsExample {\n  protected readonly darkMode = new FormControl(true);\n}",
  ],
  [
    ToggleLayoutExample,
    'import { Component, signal } from \'@angular/core\';\nimport { ToggleComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ToggleComponent],\n  template: `\n    <gog-toggle label="Label after the switch" [(checked)]="compactMode" />\n    <gog-toggle label="Label before it" labelPosition="start" [(checked)]="labelStart" />\n    <gog-toggle label="Full width" [fullWidth]="true" [(checked)]="compactMode" />\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 12px;\n      max-width: 420px;\n    }\n  `,\n})\nexport class ToggleLayoutExample {\n  protected readonly compactMode = signal(false);\n  protected readonly labelStart = signal(true);\n}',
  ],
  [
    ToggleOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ToggleComponent],\n  template: `<gog-toggle label=\"Notifications\" [(checked)]=\"notifications\" />`,\n})\nexport class ToggleOverviewExample {\n  protected readonly notifications = signal(true);\n}",
  ],
  [
    ToggleSizesExample,
    "import { Component, signal } from '@angular/core';\nimport { GogSize, ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ToggleComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-toggle [size]=\"sizeOption\" [label]=\"sizeOption\" [(checked)]=\"sizeState\" />\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      gap: 12px;\n    }\n  `,\n})\nexport class ToggleSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n  protected readonly sizeState = signal(true);\n}",
  ],
  [
    ToggleTrackLabelsExample,
    'import { Component, signal } from \'@angular/core\';\nimport { ToggleComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ToggleComponent],\n  template: `\n    <gog-toggle label="Analytics" onLabel="ON" offLabel="OFF" [(checked)]="analytics" />\n  `,\n})\nexport class ToggleTrackLabelsExample {\n  protected readonly analytics = signal(false);\n}',
  ],
]);
