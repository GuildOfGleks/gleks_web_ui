// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { ChipAvatarExample } from './chip-avatar.example';
import { ChipDisabledExample } from './chip-disabled.example';
import { ChipFullWidthExample } from './chip-full-width.example';
import { ChipIconExample } from './chip-icon.example';
import { ChipNonInteractiveExample } from './chip-non-interactive.example';
import { ChipOverviewExample } from './chip-overview.example';
import { ChipRemovableExample } from './chip-removable.example';
import { ChipShapesExample } from './chip-shapes.example';
import { ChipSizesExample } from './chip-sizes.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const CHIP_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    ChipAvatarExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `\n    <gog-chip avatarUrl=\"https://i.pravatar.cc/64\" avatarAlt=\"Jane Doe\">Jane Doe</gog-chip>\n  `,\n})\nexport class ChipAvatarExample {}",
  ],
  [
    ChipDisabledExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `<gog-chip [disabled]=\"true\">Disabled</gog-chip>`,\n})\nexport class ChipDisabledExample {}",
  ],
  [
    ChipFullWidthExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `<gog-chip [fullWidth]=\"true\">Full width</gog-chip>`,\n})\nexport class ChipFullWidthExample {}",
  ],
  [
    ChipIconExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `<gog-chip iconName=\"info\">Info</gog-chip>`,\n})\nexport class ChipIconExample {}",
  ],
  [
    ChipNonInteractiveExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `<gog-chip [clickable]=\"false\">Read only</gog-chip>`,\n})\nexport class ChipNonInteractiveExample {}",
  ],
  [
    ChipOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `<gog-chip (gogClick)=\"onClick('Design')\">Design</gog-chip>`,\n})\nexport class ChipOverviewExample {\n  protected readonly lastClicked = signal('No chip clicked yet.');\n\n  protected onClick(label: string): void {\n    this.lastClicked.set(`Clicked \\\"${label}\\\"`);\n  }\n}",
  ],
  [
    ChipRemovableExample,
    "import { Component, signal } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\ninterface Tag {\n  id: string;\n  label: string;\n}\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `\n    @for (tag of tags(); track tag.id) {\n      <gog-chip [removable]=\"true\" (gogRemove)=\"removeTag(tag.id)\">{{ tag.label }}</gog-chip>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class ChipRemovableExample {\n  protected readonly tags = signal<Tag[]>([\n    { id: 'angular', label: 'Angular' },\n    { id: 'typescript', label: 'TypeScript' },\n  ]);\n\n  protected removeTag(id: string): void {\n    this.tags.update((current) => current.filter((tag) => tag.id !== id));\n  }\n}",
  ],
  [
    ChipShapesExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `\n    <gog-chip shape=\"rounded\">Rounded</gog-chip>\n    <gog-chip shape=\"pill\">Pill</gog-chip>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class ChipShapesExample {}",
  ],
  [
    ChipSizesExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent, GogSize } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent],\n  template: `\n    @for (sizeOption of sizes; track sizeOption) {\n      <gog-chip [size]=\"sizeOption\">{{ sizeOption }}</gog-chip>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class ChipSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
]);
