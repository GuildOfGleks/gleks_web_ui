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

  protected readonly installSnippet = [
    '```bash',
    '# Installs the package and adds the stylesheet to angular.json for you.',
    'ng add @guildofgleks/ui',
    '',
    '# Or install it yourself, then follow "Import the styles" below.',
    'npm install @guildofgleks/ui',
    'yarn add @guildofgleks/ui',
    '```',
  ].join('\n');

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

  protected readonly themeAttributeSnippet = [
    '```html',
    '<!-- index.html — or set it from your own code before the app boots -->',
    '<html lang="en" data-theme="dark">',
    '```',
  ].join('\n');

  protected readonly presetSnippet = [
    '```json',
    '"styles": [',
    '  "node_modules/@guildofgleks/ui/styles/index.css",',
    '  "node_modules/@guildofgleks/ui/styles/presets/slate.css",',
    '  "src/styles.scss"',
    ']',
    '```',
  ].join('\n');

  protected readonly themeServiceSnippet = [
    '```typescript',
    "import { ThemeService, provideGogConfig } from '@guildofgleks/ui';",
    '',
    '// switching',
    'private readonly theme = inject(ThemeService);',
    '',
    "this.theme.setTheme('dark');",
    'this.theme.toggleTheme();',
    'this.theme.theme(); //  a signal — read it in a template',
    '',
    '// opt in to persistence and following the OS setting',
    'provideGogConfig({',
    "  theme: { storageKey: 'app-theme', followSystem: true },",
    '});',
    '```',
  ].join('\n');

  protected readonly formSnippet = [
    '```typescript',
    'form = new FormGroup({',
    "  email: new FormControl('', [Validators.required, Validators.email]),",
    '});',
    '```',
    '',
    '```html',
    '<form [formGroup]="form">',
    '  <gog-inputfield',
    '    label="Email"',
    '    formControlName="email"',
    '    errorMessage="A valid email is required"',
    '    errorDisplay="auto"',
    '  />',
    '</form>',
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
