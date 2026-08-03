import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, GogSize, GogVariant, IconComponent } from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'outline' | 'ghost'",
    default: "'primary'",
    description: 'Visual style of the button.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Button size.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Fully non-interactive: excluded from tab order via the native disabled attribute.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the button to fill its container.',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Forwarded to the native <button> type attribute.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Shows a spinner in place of the label and blocks activation. Uses aria-disabled rather than the native disabled attribute, so the button stays focusable.',
  },
  {
    name: 'debounce',
    type: 'number',
    default: '300',
    description:
      'Minimum time, in ms, between accepted clicks. Leading-edge throttle: the first click fires immediately, further clicks are dropped until the window elapses.',
  },
  {
    name: 'ariaLabel',
    type: 'string | null',
    default: 'null',
    description:
      'Accessible name forwarded to the native <button>. Required for icon-only buttons — a plain aria-label attribute on <gog-button> lands on the host element, not the inner button, so assistive tech never sees it.',
  },
];

@Component({
  selector: 'app-button-doc-page',
  imports: [ButtonComponent, IconComponent, MarkdownComponent, RouterLink],
  templateUrl: './button-doc-page.html',
  styleUrl: './button-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDocPage {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'button')?.tokens ?? [];

  protected readonly isLoading = signal(false);
  protected readonly lastClicked = signal('No button clicked yet.');
  protected readonly clickCount = signal(0);
  protected readonly formResult = signal('Neither button pressed yet.');

  protected readonly loadingBySize: Record<GogSize, ReturnType<typeof signal<boolean>>> = {
    xsm: signal(false),
    sm: signal(false),
    md: signal(false),
    lg: signal(false),
    slg: signal(false),
  };

  protected readonly importSnippet =
    "```typescript\nimport { ButtonComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [ButtonComponent],\n})\n```";

  protected readonly overviewSnippet =
    '```html\n<gog-button variant="primary" (gogClick)="onClick($event)">\n  Click me\n</gog-button>\n```';

  protected readonly variantsSnippet =
    '```html\n<gog-button variant="primary" size="md">Primary</gog-button>\n<gog-button variant="secondary" size="md">Secondary</gog-button>\n<gog-button variant="outline" size="md">Outline</gog-button>\n<gog-button variant="ghost" size="md">Ghost</gog-button>\n```';

  protected readonly disabledSnippet =
    '```html\n<gog-button variant="primary" [disabled]="true">Primary</gog-button>\n```';

  protected readonly loadingSnippet =
    '```html\n<gog-button\n  variant="primary"\n  [loading]="isLoading()"\n  (gogClick)="simulateLoading()"\n>\n  Simulate loading\n</gog-button>\n```';

  protected readonly fullWidthSnippet =
    '```html\n<gog-button variant="outline" [fullWidth]="true">Full width</gog-button>\n```';

  protected readonly iconOnlySnippet =
    '```html\n<gog-button variant="primary" ariaLabel="Confirm">\n  <gog-icon name="check" />\n</gog-button>\n```';

  protected readonly debounceSnippet =
    '```html\n<gog-button variant="primary" [debounce]="300" (gogClick)="onSpamClick()">\n  Click me fast\n</gog-button>\n```';

  protected readonly formSnippet =
    '```html\n<form (submit)="onFormSubmit($event)" (reset)="onFormReset()">\n  <gog-button variant="primary" type="submit">Submit</gog-button>\n  <gog-button variant="outline" type="reset">Reset</gog-button>\n</form>\n```';

  protected onClick(variant: GogVariant, size: GogSize): void {
    this.lastClicked.set(`Clicked "${variant}" (${size})`);
  }

  protected simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  protected simulateLoadingFor(size: GogSize): void {
    const target = this.loadingBySize[size];
    target.set(true);
    setTimeout(() => target.set(false), 1500);
  }

  protected onSpamClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  protected onFormSubmit(event: Event): void {
    event.preventDefault();
    this.formResult.set('Submitted via type="submit".');
  }

  protected onFormReset(): void {
    this.formResult.set('Reset via type="reset".');
  }
}
