import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { AVATAR_EXAMPLES } from '../../../examples/avatar/sources.generated';
import { AvatarBadgeExample } from '../../../examples/avatar/avatar-badge/example';
import { AvatarDecorativeExample } from '../../../examples/avatar/avatar-decorative/example';
import { AvatarFallbackExample } from '../../../examples/avatar/avatar-fallback/example';
import { AvatarGroupExample } from '../../../examples/avatar/avatar-group/example';
import { AvatarGroupSizesExample } from '../../../examples/avatar/avatar-group-sizes/example';
import { AvatarGroupSurfaceExample } from '../../../examples/avatar/avatar-group-surface/example';
import { AvatarInitialsExample } from '../../../examples/avatar/avatar-initials/example';
import { AvatarOverviewExample } from '../../../examples/avatar/avatar-overview/example';
import { AvatarShapesExample } from '../../../examples/avatar/avatar-shapes/example';
import { AvatarSizesExample } from '../../../examples/avatar/avatar-sizes/example';

const AVATAR_INPUTS: readonly ApiRow[] = [
  {
    name: 'src',
    type: 'string | null',
    default: 'null',
    description:
      'The picture. Falls back to the initials when unset, when it fails, and when it failed before hydration.',
  },
  {
    name: 'name',
    type: 'string',
    default: "''",
    description: 'Whose avatar: its accessible name, and the source of the initials.',
  },
  {
    name: 'initials',
    type: 'string | undefined',
    default: 'from name',
    description: "Overrides the derived initials — an organisation's own short form.",
  },
  {
    name: 'iconName',
    type: 'GogIconName',
    default: "'user'",
    description: 'The last fallback, when there is neither a picture nor any initials.',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description:
      "'xsm' | 'sm' | 'md' | 'lg' | 'slg' — 24, 32, 48, 64 and 96px, the skeleton circle's sizes.",
  },
  {
    name: 'shape',
    type: 'GogAvatarShape',
    default: "'circle'",
    description: "'circle' for a person, 'rounded' for an organisation or a product.",
  },
  {
    name: 'decorative',
    type: 'boolean',
    default: 'false',
    description:
      'Hides it from assistive tech, beside a name already written out. An avatar with no name is decorative whatever this says.',
  },
];

const GROUP_INPUTS: readonly ApiRow[] = [
  {
    name: 'max',
    type: 'number | null',
    default: 'null',
    description:
      'The most avatars drawn, the +N one included. Unset, every avatar is drawn. The +N is named by GOG_CONFIG.labels.moreAvatars, "N more" by default.',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: "One size for the whole row; it wins over each avatar's own size.",
  },
  {
    name: 'ariaLabel',
    type: 'string | undefined',
    default: 'undefined',
    description: 'Names the group — "Assignees", "Shared with".',
  },
];

@Component({
  selector: 'app-avatar-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './avatar-doc-page.html',
  styleUrl: './avatar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarDocPage {
  protected readonly avatarInputs = AVATAR_INPUTS;
  protected readonly groupInputs = GROUP_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'avatar')?.tokens ?? [];

  protected readonly sources = AVATAR_EXAMPLES;
  protected readonly examples = {
    overview: AvatarOverviewExample,
    fallback: AvatarFallbackExample,
    sizes: AvatarSizesExample,
    shapes: AvatarShapesExample,
    initials: AvatarInitialsExample,
    badge: AvatarBadgeExample,
    decorative: AvatarDecorativeExample,
    group: AvatarGroupExample,
    groupSizes: AvatarGroupSizesExample,
    groupSurface: AvatarGroupSurfaceExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { AvatarComponent, AvatarGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [AvatarComponent, AvatarGroupComponent],',
    '})',
    '```',
  ].join('\n');
}
