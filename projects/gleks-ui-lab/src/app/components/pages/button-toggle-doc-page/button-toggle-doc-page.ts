import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonToggleGroupComponent,
  GogButtonToggleAppearance,
  GogButtonToggleOptionDirective,
  GogIconName,
  GogSize,
  IconComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

interface ViewOption {
  readonly id: string;
  readonly name: string;
  readonly icon: GogIconName;
  readonly disabled?: boolean;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'TOption[]',
    default: '[]',
    description: 'The buttons. Your own objects — nothing has to be mapped into a fixed shape.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description:
      'How an option turns into its button label: a property path (dot-paths included) or a function.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description:
      'How an option turns into the emitted value. Set it to null and the group emits the option object itself.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which options are non-selectable.',
  },
  {
    name: 'optionIcon',
    type: 'string | ((o: TOption) => GogIconName | null) | null',
    default: 'null',
    description: 'An optional leading icon per button.',
  },
  {
    name: 'value',
    type: 'TValue | TValue[] | null',
    default: 'null',
    description:
      'The selection: one value, or an array when multiple is on. Two-way bindable with [(value)].',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description:
      'Several buttons can be active at once. This changes the widget’s semantics, not just its behaviour — see Accessibility.',
  },
  {
    name: 'appearance',
    type: "'joined' | 'separated'",
    default: "'joined'",
    description:
      'joined is one segmented control with shared borders; separated is discrete buttons with a gap.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Which way the buttons stack.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "GOG_CONFIG.control.size ?? 'md'",
    description: 'Button padding and typography.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the whole group.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the group so its buttons share the container’s width.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "''",
    description:
      'Accessible name for the group. Worth setting — the buttons alone rarely say what the group is for.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each toggle in the group. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'TValue | TValue[] | null',
    default: '—',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const VIEWS: ViewOption[] = [
  { id: 'list', name: 'List', icon: 'sort' },
  { id: 'grid', name: 'Grid', icon: 'checkbox' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  { id: 'timeline', name: 'Timeline', icon: 'clock', disabled: true },
];

const FORMATS: ViewOption[] = [
  { id: 'bold', name: 'Bold', icon: 'check' },
  { id: 'italic', name: 'Italic', icon: 'info' },
  { id: 'underline', name: 'Underline', icon: 'warning' },
];

@Component({
  selector: 'app-button-toggle-doc-page',
  imports: [
    ButtonToggleGroupComponent,
    GogButtonToggleOptionDirective,
    IconComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './button-toggle-doc-page.html',
  styleUrl: './button-toggle-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleDocPage {
  protected readonly views = VIEWS;
  protected readonly formats = FORMATS;
  protected readonly appearances: GogButtonToggleAppearance[] = ['joined', 'separated'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly view = signal<unknown>('list');
  protected readonly appearanceView = signal<unknown>('grid');
  protected readonly sizeView = signal<unknown>('list');
  protected readonly activeFormats = signal<unknown>(['bold']);
  protected readonly iconView = signal<unknown>('grid');
  protected readonly slotView = signal<unknown>('calendar');

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button-toggle')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { ButtonToggleGroupComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonToggleGroupComponent],\n})\n```";

  protected readonly overviewHtml = [
    '<gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="view" />',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonToggleGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent],',
    '  template: `',
    '    <gog-button-toggle-group ariaLabel="View" [options]="views" [(value)]="view" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly views = [',
    "    { id: 'list', name: 'List' },",
    "    { id: 'grid', name: 'Grid' },",
    "    { id: 'calendar', name: 'Calendar' },",
    "    { id: 'timeline', name: 'Timeline', disabled: true },",
    '  ];',
    "  protected readonly view = signal<unknown>('list');",
    '}',
  ].join('\n');

  protected readonly multipleHtml = [
    '<gog-button-toggle-group',
    '  ariaLabel="Text formatting"',
    '  [options]="formats"',
    '  [multiple]="true"',
    '  [(value)]="activeFormats"',
    '/>',
  ].join('\n');
  protected readonly multipleTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonToggleGroupComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent],',
    '  template: `',
    '    <gog-button-toggle-group',
    '      ariaLabel="Text formatting"',
    '      [options]="formats"',
    '      [multiple]="true"',
    '      [(value)]="activeFormats"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // With multiple on, value is an array.',
    "  protected readonly activeFormats = signal<unknown>(['bold']);",
    '}',
  ].join('\n');

  protected readonly appearanceHtml = [
    '<gog-button-toggle-group appearance="joined" [options]="views" [(value)]="view" />',
    '<gog-button-toggle-group appearance="separated" [options]="views" [(value)]="view" />',
    '',
    '<!-- Vertical works with either appearance. -->',
    '<gog-button-toggle-group orientation="vertical" [options]="views" [(value)]="view" />',
  ].join('\n');
  protected readonly appearanceTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonToggleGroupComponent, GogButtonToggleAppearance } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent],',
    '  template: `',
    '    @for (option of appearances; track option) {',
    '      <gog-button-toggle-group',
    '        [appearance]="option"',
    '        [options]="views"',
    '        [(value)]="view"',
    '      />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly appearances: GogButtonToggleAppearance[] = ['joined', 'separated'];",
    '}',
  ].join('\n');

  protected readonly iconsHtml = [
    '<gog-button-toggle-group',
    '  ariaLabel="View"',
    '  optionIcon="icon"',
    '  [options]="views"',
    '  [(value)]="iconView"',
    '/>',
  ].join('\n');
  protected readonly iconsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonToggleGroupComponent, GogIconName } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent],',
    '  template: `',
    '    <gog-button-toggle-group optionIcon="icon" [options]="views" [(value)]="iconView" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly views: { id: string; name: string; icon: GogIconName }[] = [',
    "    { id: 'list', name: 'List', icon: 'sort' },",
    "    { id: 'grid', name: 'Grid', icon: 'checkbox' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly slotHtml = [
    '<gog-button-toggle-group [options]="views" [(value)]="slotView">',
    '  <ng-template gogButtonToggleOption let-option let-selected="selected">',
    '    <gog-icon [name]="asView(option).icon" />',
    '    <span>{{ asView(option).name }}</span>',
    '    @if (selected) {',
    '      <gog-icon name="check" />',
    '    }',
    '  </ng-template>',
    '</gog-button-toggle-group>',
  ].join('\n');
  protected readonly slotTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  ButtonToggleGroupComponent,',
    '  GogButtonToggleOptionDirective,',
    '  IconComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent, GogButtonToggleOptionDirective, IconComponent],',
    '  template: `',
    '    <gog-button-toggle-group [options]="views" [(value)]="slotView">',
    '      <ng-template gogButtonToggleOption let-option let-selected="selected">',
    '        <gog-icon [name]="asView(option).icon" />',
    '        <span>{{ asView(option).name }}</span>',
    '        @if (selected) {',
    '          <gog-icon name="check" />',
    '        }',
    '      </ng-template>',
    '    </gog-button-toggle-group>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // The slot hands the option back as `unknown`, so narrow it once here rather than',
    '  // sprinkling `$any(...)` through the template.',
    '  protected asView(option: unknown): ViewOption {',
    '    return option as ViewOption;',
    '  }',
    '}',
  ].join('\n');

  /** See `slotTs` — the template context cannot infer `TOption` from the group. */
  protected asView(option: unknown): ViewOption {
    return option as ViewOption;
  }

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-button-toggle-group [size]="sizeOption" [options]="views" [(value)]="sizeView" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonToggleGroupComponent, GogSize } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonToggleGroupComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-button-toggle-group [size]="sizeOption" [options]="views" [(value)]="sizeView" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '}',
  ].join('\n');
}
