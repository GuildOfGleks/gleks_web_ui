// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ChipAvatarExample } from './chip-avatar/example';
import { ChipDisabledExample } from './chip-disabled/example';
import { ChipFullWidthExample } from './chip-full-width/example';
import { ChipIconExample } from './chip-icon/example';
import { ChipNonInteractiveExample } from './chip-non-interactive/example';
import { ChipOverviewExample } from './chip-overview/example';
import { ChipRemovableExample } from './chip-removable/example';
import { ChipShapesExample } from './chip-shapes/example';
import { ChipSizesExample } from './chip-sizes/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const CHIP_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ChipAvatarExample,
    {
      html: '<div class="example">\n  <gog-chip avatarUrl="https://i.pravatar.cc/64" avatarAlt="Jane Doe">Jane Doe</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipAvatarExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ChipDisabledExample,
    {
      html: '<div class="example">\n  <gog-chip [disabled]="true">Disabled</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipDisabledExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ChipFullWidthExample,
    {
      html: '<div class="example">\n  <gog-chip [fullWidth]="true">Full width</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipFullWidthExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ChipIconExample,
    {
      html: '<div class="example">\n  <gog-chip iconName="info">Info</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipIconExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ChipNonInteractiveExample,
    {
      html: '<div class="example">\n  <gog-chip [clickable]="false">Read only</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipNonInteractiveExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ChipOverviewExample,
    {
      html: '<div class="example">\n  <gog-chip (gogClick)="onClick(\'Design\')">Design</gog-chip>\n  <p class="readout">{{ lastClicked() }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipOverviewExample {\n  protected readonly lastClicked = signal('No chip clicked yet.');\n\n  protected onClick(label: string): void {\n    this.lastClicked.set(`Clicked \"${label}\"`);\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    ChipRemovableExample,
    {
      html: '<div class="example">\n  @for (tag of tags(); track tag.id) {\n    <gog-chip [removable]="true" (gogRemove)="removeTag(tag.id)">{{ tag.label }}</gog-chip>\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\ninterface Tag {\n  id: string;\n  label: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipRemovableExample {\n  protected readonly tags = signal<Tag[]>([\n    { id: 'angular', label: 'Angular' },\n    { id: 'typescript', label: 'TypeScript' },\n  ]);\n\n  protected removeTag(id: string): void {\n    this.tags.update((current) => current.filter((tag) => tag.id !== id));\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    ChipShapesExample,
    {
      html: '<div class="example">\n  <gog-chip shape="rounded">Rounded</gog-chip>\n  <gog-chip shape="pill">Pill</gog-chip>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipShapesExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    ChipSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-chip [size]="sizeOption">{{ sizeOption }}</gog-chip>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ChipComponent, GogSize } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ChipComponent],\n})\nexport class ChipSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
]);
