import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  type GogAccordionItem,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { isColorValue } from '../../shared/token-value';
import { TOKEN_SECTIONS } from './token-reference-data';

interface FullCssSection extends GogAccordionItem {
  readonly markdown?: string;
}

@Component({
  selector: 'app-theming-page',
  imports: [
    RouterLink,
    MarkdownComponent,
    AccordionComponent,
    GogAccordionContentDirective,
    ButtonComponent,
  ],
  templateUrl: './theming-page.html',
  styleUrl: './theming-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemingPage {
  private readonly content = httpResource.text(() => '/docs/theming.md');
  private readonly themeStarterCss = httpResource.text(() => '/docs/styles/theme-starter.css');

  protected readonly markdown = computed(() => this.content.value());
  protected readonly hasMarkdown = computed(() => this.content.status() === 'resolved');

  protected readonly tokenSections = TOKEN_SECTIONS;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // Every token's real *current* resolved value — reflects a live theme-generator override too
  // (see ThemeGeneratorState: overrides land on <html>, which getComputedStyle reads straight
  // through), not just each token's shipped default.
  private readonly resolvedValues = signal<Record<string, string>>({});

  protected valueOf(name: string): string {
    return this.resolvedValues()[name] ?? '';
  }

  protected isColor(name: string): boolean {
    return isColorValue(this.valueOf(name));
  }

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;

      const style = getComputedStyle(document.documentElement);
      const values: Record<string, string> = {};
      for (const section of this.tokenSections) {
        for (const token of section.tokens) {
          values[token.name] = style.getPropertyValue(token.name).trim();
        }
      }
      this.resolvedValues.set(values);
    });
  }

  protected readonly fullCssSections = computed<FullCssSection[]>(() => {
    const css = this.themeStarterCss.value();
    return [
      {
        id: 'theme-starter',
        title: 'Theme Starter — Copy & Customize',
        markdown: css ? '```css\n' + css + '\n```' : undefined,
      },
    ];
  });
}
