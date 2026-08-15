import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GogIconName,
  GogSize,
  GogTagIconDirective,
  GogTagShape,
  GogTagVariant,
} from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TAG_EXAMPLE_SOURCES } from '../../../examples/tag/sources.generated';
import { TagCustomIconExample } from '../../../examples/tag/tag-custom-icon.example';
import { TagFullWidthExample } from '../../../examples/tag/tag-full-width.example';
import { TagOverviewExample } from '../../../examples/tag/tag-overview.example';
import { TagShapesExample } from '../../../examples/tag/tag-shapes.example';
import { TagSizesExample } from '../../../examples/tag/tag-sizes.example';
import { TagVariantsExample } from '../../../examples/tag/tag-variants.example';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'variant',
    type: "'success' | 'danger' | 'warning' | 'info'",
    default: "'info'",
    description: 'Semantic color.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Font size, padding, gap, and icon size.',
  },
  {
    name: 'shape',
    type: "'rounded' | 'pill'",
    default: "'rounded'",
    description: 'Corner radius style.',
  },
  {
    name: 'iconName',
    type: 'GogIconName | null',
    default: 'null',
    description: 'Leading icon.',
  },
  {
    name: 'iconTemplate',
    type: 'TemplateRef<unknown> | null',
    default: 'null',
    description:
      'Deprecated since 21.3.0, removed in 21.5.0 — project an <ng-template gogTagIcon> instead. Still works, and the projected slot wins when both are present.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description:
      'By default the tag fits its text with no wrapping. Set true to stretch it to fill its container instead.',
  },
];

@Component({
  selector: 'app-tag-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(TAG_EXAMPLE_SOURCES)],
  templateUrl: './tag-doc-page.html',
  styleUrl: './tag-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDocPage {
  protected readonly variants: GogTagVariant[] = ['success', 'danger', 'warning', 'info'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogTagShape[] = ['rounded', 'pill'];
  protected readonly variantIcons: Record<GogTagVariant, GogIconName> = {
    success: 'check',
    danger: 'error',
    warning: 'warning',
    info: 'info',
  };

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tag')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TagComponent],\n})\n```";

  protected readonly migrateIconSnippet = [
    '```html',
    '<!-- 21.2.x — an input taking a TemplateRef declared elsewhere -->',
    '<ng-template #starIcon><gog-icon name="checkbox-checked" /></ng-template>',
    '<gog-tag [iconTemplate]="starIcon">Featured</gog-tag>',
    '',
    '<!-- 21.3.0 — the markup lives where it is used -->',
    '<gog-tag>',
    '  <ng-template gogTagIcon><gog-icon name="checkbox-checked" /></ng-template>',
    '  Featured',
    '</gog-tag>',
    '```',
  ].join('\n');

  /** Each example is a file under `src/app/examples/tag/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    customIcon: TagCustomIconExample,
    fullWidth: TagFullWidthExample,
    overview: TagOverviewExample,
    shapes: TagShapesExample,
    sizes: TagSizesExample,
    variants: TagVariantsExample,
  };
}
