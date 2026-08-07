import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  type GogAccordionItem,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
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
