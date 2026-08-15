// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { ToggleDisabledExample } from './toggle-disabled/example';
import { ToggleFormsExample } from './toggle-forms/example';
import { ToggleLayoutExample } from './toggle-layout/example';
import { ToggleOverviewExample } from './toggle-overview/example';
import { ToggleSizesExample } from './toggle-sizes/example';
import { ToggleTrackLabelsExample } from './toggle-track-labels/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TOGGLE_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    ToggleDisabledExample,
    {
      html: '<div class="example">\n  <gog-toggle label="Disabled, off" [disabled]="true" />\n  <gog-toggle label="Disabled, on" [disabled]="true" [checked]="true" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent],\n})\nexport class ToggleDisabledExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n}',
    },
  ],
  [
    ToggleFormsExample,
    {
      html: '<div class="example">\n  <gog-toggle label="Dark mode" [formControl]="darkMode" />\n  <p>Control value: {{ darkMode.value }}</p>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule } from '@angular/forms';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent, ReactiveFormsModule],\n})\nexport class ToggleFormsExample {\n  protected readonly darkMode = new FormControl(true);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n}',
    },
  ],
  [
    ToggleLayoutExample,
    {
      html: '<div class="example">\n  <gog-toggle label="Label after the switch" [(checked)]="compactMode" />\n  <gog-toggle label="Label before it" labelPosition="start" [(checked)]="labelStart" />\n  <gog-toggle label="Full width" [fullWidth]="true" [(checked)]="compactMode" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent],\n})\nexport class ToggleLayoutExample {\n  protected readonly compactMode = signal(false);\n  protected readonly labelStart = signal(true);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    ToggleOverviewExample,
    {
      html: '<div class="example">\n  <gog-toggle label="Notifications" [(checked)]="notifications" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent],\n})\nexport class ToggleOverviewExample {\n  protected readonly notifications = signal(true);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    ToggleSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-toggle [size]="sizeOption" [label]="sizeOption" [(checked)]="sizeState" />\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogSize, ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent],\n})\nexport class ToggleSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n  protected readonly sizeState = signal(true);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n}',
    },
  ],
  [
    ToggleTrackLabelsExample,
    {
      html: '<div class="example">\n  <gog-toggle label="Analytics" onLabel="ON" offLabel="OFF" [(checked)]="analytics" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ToggleComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ToggleComponent],\n})\nexport class ToggleTrackLabelsExample {\n  protected readonly analytics = signal(false);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
]);
