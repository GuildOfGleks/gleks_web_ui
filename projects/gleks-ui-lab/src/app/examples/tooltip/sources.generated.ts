// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { TooltipDelaysExample } from './tooltip-delays.example';
import { TooltipOverviewExample } from './tooltip-overview.example';
import { TooltipPositionsExample } from './tooltip-positions.example';
import { TooltipTemplateExample } from './tooltip-template.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const TOOLTIP_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    TooltipDelaysExample,
    'import { Component } from \'@angular/core\';\nimport { ButtonComponent, GogTooltipDirective } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent, GogTooltipDirective],\n  template: `\n    <gog-button gogTooltip="Appears at once" [gogTooltipShowDelay]="0">No delay</gog-button>\n    <gog-button gogTooltip="Never shown" [gogTooltipDisabled]="true">Disabled</gog-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TooltipDelaysExample {}',
  ],
  [
    TooltipOverviewExample,
    "import { Component } from '@angular/core';\nimport { ChipComponent, GogTooltipDirective } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ChipComponent, GogTooltipDirective],\n  template: `\n    <button gogTooltip=\"Save changes\">Save</button>\n    <gog-chip [gogTooltip]=\"hint\">Draft</gog-chip>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TooltipOverviewExample {\n  protected readonly hint = 'Not visible to anyone else yet';\n}",
  ],
  [
    TooltipPositionsExample,
    "import { Component } from '@angular/core';\nimport { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent, GogTooltipDirective],\n  template: `\n    @for (position of positions; track position) {\n      <gog-button [gogTooltip]=\"position\" [gogTooltipPosition]=\"position\">\n        {{ position }}\n      </gog-button>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TooltipPositionsExample {\n  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];\n}",
  ],
  [
    TooltipTemplateExample,
    "import { Component } from '@angular/core';\nimport { ButtonComponent, GogTooltipDirective, TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent, TagComponent, GogTooltipDirective],\n  template: `\n    <ng-template #richHint>\n      <strong>Deployment blocked</strong>\n      <p>Two checks are still running. <gog-tag variant=\"warning\">CI</gog-tag></p>\n    </ng-template>\n\n    <gog-button [gogTooltip]=\"richHint\">Deploy</gog-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      align-items: center;\n      gap: 12px;\n    }\n  `,\n})\nexport class TooltipTemplateExample {}",
  ],
]);
