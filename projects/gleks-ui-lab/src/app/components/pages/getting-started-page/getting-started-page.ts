import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';

interface NextLink {
  readonly title: string;
  readonly text: string;
  readonly path: string;
}

const NEXT_LINKS: readonly NextLink[] = [
  {
    title: 'Components',
    text: 'The full catalogue, with every input, output and variant a component supports.',
    path: '/components/button',
  },
  {
    title: 'Theming',
    text: 'Adapt colors, spacing and typography to your brand — or drop in a ready-made preset.',
    path: '/general/theming',
  },
  {
    title: 'Global Configuration',
    text: 'Everything you can set once, app-wide, instead of per instance.',
    path: '/general/global-config',
  },
];

@Component({
  selector: 'app-getting-started-page',
  imports: [MarkdownComponent, RouterLink, SinceBadgeComponent],
  templateUrl: './getting-started-page.html',
  styleUrl: './getting-started-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedPage {
  protected readonly nextLinks = NEXT_LINKS;

  protected readonly installSnippet = '```bash\nnpm install @guildofgleks/ui\n```';

  protected readonly stylesSnippet =
    '```json\n"styles": [\n  "node_modules/@guildofgleks/ui/styles/index.css",\n  "src/styles.scss"\n]\n```';

  protected readonly useSnippet = [
    '```typescript',
    "import { Component } from '@angular/core';",
    "import { ButtonComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [ButtonComponent],',
    '  template: `<gog-button variant="primary">Click me</gog-button>`,',
    '})',
    'export class ExampleComponent {}',
    '```',
  ].join('\n');

  protected readonly configSnippet = [
    '```typescript',
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'bootstrapApplication(App, {',
    '  providers: [',
    '    provideGogConfig({',
    "      control: { size: 'sm', errorDisplay: 'auto' },",
    "      datepicker: { locale: 'de-DE', firstDayOfWeek: 1 },",
    '    }),',
    '  ],',
    '});',
    '```',
  ].join('\n');
}
