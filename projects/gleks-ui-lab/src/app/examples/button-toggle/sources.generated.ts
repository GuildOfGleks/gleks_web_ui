// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ButtonToggleAppearanceExample } from './button-toggle-appearance/example';
import { ButtonToggleIconsExample } from './button-toggle-icons/example';
import { ButtonToggleMultipleExample } from './button-toggle-multiple/example';
import { ButtonToggleOverviewExample } from './button-toggle-overview/example';
import { ButtonToggleSizesExample } from './button-toggle-sizes/example';
import { ButtonToggleSlotExample } from './button-toggle-slot/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const BUTTON_TOGGLE_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ButtonToggleAppearanceExample,
    {
      html: '<div class="example">\n  @for (option of appearances; track option) {\n    <gog-button-toggle-group [appearance]="option" [options]="views" [(value)]="view" />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonToggleGroupComponent, GogButtonToggleAppearance } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent],\n})\nexport class ButtonToggleAppearanceExample {\n  protected readonly appearances: GogButtonToggleAppearance[] = ['joined', 'separated'];\n  protected readonly views = [\n    { id: 'list', name: 'List' },\n    { id: 'grid', name: 'Grid' },\n    { id: 'calendar', name: 'Calendar' },\n  ];\n  protected readonly view = signal<unknown>('grid');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 16px;\n}',
    },
  ],
  [
    ButtonToggleIconsExample,
    {
      html: '<div class="example">\n  <gog-button-toggle-group optionIcon="icon" [options]="views" [(value)]="iconView" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonToggleGroupComponent, GogIconName } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent],\n})\nexport class ButtonToggleIconsExample {\n  protected readonly views: { id: string; name: string; icon: GogIconName }[] = [\n    { id: 'list', name: 'List', icon: 'sort' },\n    { id: 'grid', name: 'Grid', icon: 'checkbox' },\n  ];\n  protected readonly iconView = signal<unknown>('grid');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ButtonToggleMultipleExample,
    {
      html: '<div class="example">\n  <gog-button-toggle-group\n    ariaLabel="Text formatting"\n    [options]="formats"\n    [multiple]="true"\n    [(value)]="activeFormats"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonToggleGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent],\n})\nexport class ButtonToggleMultipleExample {\n  protected readonly formats = [\n    { id: 'bold', name: 'Bold' },\n    { id: 'italic', name: 'Italic' },\n    { id: 'underline', name: 'Underline' },\n  ];\n\n  // With multiple on, value is an array.\n  protected readonly activeFormats = signal<unknown>(['bold']);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ButtonToggleOverviewExample,
    {
      html: '<div class="example">\n  <gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="view" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonToggleGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent],\n})\nexport class ButtonToggleOverviewExample {\n  protected readonly views = [\n    { id: 'list', name: 'List' },\n    { id: 'grid', name: 'Grid' },\n    { id: 'calendar', name: 'Calendar' },\n    { id: 'timeline', name: 'Timeline', disabled: true },\n  ];\n  protected readonly view = signal<unknown>('list');\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ButtonToggleSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-button-toggle-group [size]="sizeOption" [options]="views" [(value)]="sizeView" />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonToggleGroupComponent, GogSize } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent],\n})\nexport class ButtonToggleSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n  protected readonly views = [\n    { id: 'list', name: 'List' },\n    { id: 'grid', name: 'Grid' },\n    { id: 'calendar', name: 'Calendar' },\n  ];\n  protected readonly sizeView = signal<unknown>('list');\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 16px;\n}',
    },
  ],
  [
    ButtonToggleSlotExample,
    {
      html: '<div class="example">\n  <gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="slotView">\n    <ng-template gogButtonToggleOption let-option let-selected="selected">\n      <gog-icon [name]="asView(option).icon" />\n      <span>{{ asView(option).name }}</span>\n      @if (selected) {\n        <gog-icon name="check" />\n      }\n    </ng-template>\n  </gog-button-toggle-group>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport {\n  ButtonToggleGroupComponent,\n  GogButtonToggleOptionDirective,\n  GogIconName,\n  IconComponent,\n} from '@guildofgleks/ui';\n\ninterface ViewOption {\n  readonly id: string;\n  readonly name: string;\n  readonly icon: GogIconName;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonToggleGroupComponent, GogButtonToggleOptionDirective, IconComponent],\n})\nexport class ButtonToggleSlotExample {\n  protected readonly views: ViewOption[] = [\n    { id: 'list', name: 'List', icon: 'sort' },\n    { id: 'grid', name: 'Grid', icon: 'checkbox' },\n    { id: 'calendar', name: 'Calendar', icon: 'calendar' },\n  ];\n  protected readonly slotView = signal<unknown>('calendar');\n\n  // The slot hands the option back as `unknown` — the directive cannot see the group's TOption —\n  // so narrow it once here rather than sprinkling `$any(...)` through the template.\n  protected asView(option: unknown): ViewOption {\n    return option as ViewOption;\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
]);
