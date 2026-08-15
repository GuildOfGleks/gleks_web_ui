// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { SkeletonAnimationsExample } from './skeleton-animations/example';
import { SkeletonChatExample } from './skeleton-chat/example';
import { SkeletonDimensionsExample } from './skeleton-dimensions/example';
import { SkeletonLinesExample } from './skeleton-lines/example';
import { SkeletonOverviewExample } from './skeleton-overview/example';
import { SkeletonProductsExample } from './skeleton-products/example';
import { SkeletonProfileExample } from './skeleton-profile/example';
import { SkeletonShapesExample } from './skeleton-shapes/example';
import { SkeletonSizesExample } from './skeleton-sizes/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const SKELETON_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    SkeletonAnimationsExample,
    {
      html: '<div class="example">\n  @for (animationOption of animations; track animationOption) {\n    <gog-skeleton shape="rect" size="xsm" [animation]="animationOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSkeletonAnimation, SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonAnimationsExample {\n  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SkeletonChatExample,
    {
      html: '<div class="example">\n  <div class="chat-thread">\n    @for (message of messages; track $index) {\n      <div class="chat-row" [class.chat-row--mine]="message.fromMe">\n        @if (!message.fromMe) {\n          <gog-skeleton shape="circle" size="xsm" />\n        }\n        <gog-skeleton shape="rect" size="sm" [width]="message.width" />\n      </div>\n    }\n  </div>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\ninterface ChatMessage {\n  fromMe: boolean;\n  width: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonChatExample {\n  protected readonly messages: ChatMessage[] = [\n    { fromMe: false, width: '55%' },\n    { fromMe: true, width: '38%' },\n    { fromMe: false, width: '68%' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.chat-thread {\n  display: grid;\n  gap: 10px;\n  max-width: 380px;\n}\n.chat-row {\n  display: flex;\n  align-items: flex-end;\n  gap: 10px;\n}\n.chat-row--mine {\n  justify-content: flex-end;\n}',
    },
  ],
  [
    SkeletonDimensionsExample,
    {
      html: '<div class="example">\n  <gog-skeleton shape="rect" width="100%" height="64px" />\n  <gog-skeleton shape="circle" width="56px" />\n  <gog-skeleton shape="rect" [rounded]="false" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonDimensionsExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SkeletonLinesExample,
    {
      html: '<div class="example">\n  <gog-skeleton shape="text" [lines]="1" />\n  <gog-skeleton shape="text" [lines]="3" />\n  <gog-skeleton shape="text" [lines]="5" size="sm" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonLinesExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SkeletonOverviewExample,
    {
      html: '<div class="example">\n  <gog-skeleton shape="text" [lines]="3" style="width: 220px" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonOverviewExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    SkeletonProductsExample,
    {
      html: '<div class="example">\n  <div class="product-grid">\n    @for (placeholder of [0, 1, 2, 3]; track placeholder) {\n      <div class="product-card">\n        <gog-skeleton shape="rect" height="120px" />\n        <gog-skeleton shape="text" width="80%" />\n        <gog-skeleton shape="text" width="30%" size="sm" />\n      </div>\n    }\n  </div>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonProductsExample {\n  protected readonly loading = signal(true);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}\n.product-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n  gap: 16px;\n  max-width: 620px;\n}\n.product-card {\n  display: grid;\n  gap: 8px;\n}',
    },
  ],
  [
    SkeletonProfileExample,
    {
      html: '<div class="example">\n  @if (loading()) {\n    <div class="profile-card__header">\n      <gog-skeleton shape="circle" size="lg" ariaLabel="Loading profile" />\n      <div class="profile-card__header-text">\n        <gog-skeleton shape="text" width="65%" />\n        <gog-skeleton shape="text" width="40%" size="sm" />\n      </div>\n    </div>\n    <gog-skeleton shape="rect" size="md" />\n    <gog-skeleton shape="text" [lines]="3" />\n  } @else {\n    <!-- real avatar, name, banner, bio -->\n  }\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonProfileExample {\n  protected readonly loading = signal(true);\n}",
      css: '.example {\n  display: grid;\n  gap: 12px;\n  max-width: 420px;\n}\n.profile-card__header {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n}\n.profile-card__header-text {\n  display: grid;\n  gap: 8px;\n  flex: 1 1 auto;\n  min-width: 0;\n}',
    },
  ],
  [
    SkeletonShapesExample,
    {
      html: '<div class="example">\n  <gog-skeleton shape="text" [lines]="3" style="width: 220px" />\n  <gog-skeleton shape="circle" size="lg" />\n  <gog-skeleton shape="rect" size="sm" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonShapesExample {}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
  [
    SkeletonSizesExample,
    {
      html: '<div class="example">\n  @for (sizeOption of sizes; track sizeOption) {\n    <gog-skeleton shape="circle" [size]="sizeOption" />\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogSize, SkeletonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [SkeletonComponent],\n})\nexport class SkeletonSizesExample {\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  max-width: 420px;\n}',
    },
  ],
]);
