// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { BadgeDotExample } from './badge-dot/example';
import { BadgeOverviewExample } from './badge-overview/example';
import { BadgePositionsExample } from './badge-positions/example';
import { BadgeVariantsExample } from './badge-variants/example';
import { BadgeZeroExample } from './badge-zero/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const BADGE_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    BadgeDotExample,
    {
      html: '<div class="example">\n  <gog-icon name="info" gogBadge badgeDot badgeAriaLabel="Unread updates" />\n  <gog-button gogBadge badgeDot badgeVariant="success">Synced</gog-button>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ButtonComponent, GogBadgeDirective, IconComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, IconComponent, GogBadgeDirective],\n})\nexport class BadgeDotExample {}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    BadgeOverviewExample,
    {
      html: '<div class="example">\n  <gog-button gogBadge="12" badgeAriaLabel="12 unread messages">Inbox</gog-button>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, GogBadgeDirective],\n})\nexport class BadgeOverviewExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    BadgePositionsExample,
    {
      html: '<div class="example">\n  @for (position of positions; track position) {\n    <gog-button gogBadge="4" [badgePosition]="position">{{ position }}</gog-button>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ButtonComponent, GogBadgeDirective, GogBadgePosition } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, GogBadgeDirective],\n})\nexport class BadgePositionsExample {\n  protected readonly positions: GogBadgePosition[] = [\n    'top-end',\n    'top-start',\n    'bottom-end',\n    'bottom-start',\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    BadgeVariantsExample,
    {
      html: '<div class="example">\n  @for (variantOption of variants; track variantOption) {\n    <gog-button gogBadge="7" [badgeVariant]="variantOption">{{ variantOption }}</gog-button>\n  }\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { ButtonComponent, GogBadgeDirective, GogTagVariant } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, GogBadgeDirective],\n})\nexport class BadgeVariantsExample {\n  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];\n}",
      css: '.example {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    },
  ],
  [
    BadgeZeroExample,
    {
      html: '<div class="example">\n  <gog-button [gogBadge]="count()" (gogClick)="bump()"\n    >Inbox — click to change the count</gog-button\n  >\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [ButtonComponent, GogBadgeDirective],\n})\nexport class BadgeZeroExample {\n  // Nothing renders while this is 0 — no @if needed at the call site.\n  protected readonly count = signal(0);\n\n  protected bump(): void {\n    this.count.update((value) => (value + 1) % 3);\n  }\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
]);
