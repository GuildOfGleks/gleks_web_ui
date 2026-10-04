import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TAG_EXAMPLES } from '../../../examples/tag/sources.generated';
import { TagAccentExample } from '../../../examples/tag/tag-accent/example';
import { TagOverviewExample } from '../../../examples/tag/tag-overview/example';
import { TagShapesExample } from '../../../examples/tag/tag-shapes/example';
import { TagVariantsExample } from '../../../examples/tag/tag-variants/example';
import { TagWidthExample } from '../../../examples/tag/tag-width/example';

const API_INPUTS: readonly ApiRow[] = [
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
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description:
      'By default the tag fits its text with no wrapping. Set true to stretch it to fill its container instead.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  { name: '(default)', description: "The tag's text." },
  {
    name: 'gogTagIcon',
    type: 'none',
    description: 'An <ng-template> that replaces the leading icon. Wins over iconName.',
  },
];

@Component({
  selector: 'app-tag-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './tag-doc-page.html',
  styleUrl: './tag-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'tag')?.tokens ?? [];

  protected readonly sources = TAG_EXAMPLES;
  protected readonly examples = {
    overview: TagOverviewExample,
    variants: TagVariantsExample,
    shapes: TagShapesExample,
    width: TagWidthExample,
    accent: TagAccentExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { TagComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TagComponent],\n})\n```";
}
