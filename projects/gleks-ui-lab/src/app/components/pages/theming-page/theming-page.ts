import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  type GogAccordionItem,
} from '@guildofgleks/ui';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from './token-reference-data';
import { injectFullLibraryCss } from './full-library-css';

interface FullCssSection extends GogAccordionItem {
  readonly markdown?: string;
}

@Component({
  selector: 'app-theming-page',
  imports: [MarkdownComponent, AccordionComponent, GogAccordionContentDirective],
  templateUrl: './theming-page.html',
  styleUrl: './theming-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemingPage {
  private readonly content = httpResource.text(() => '/docs/theming.md');
  private readonly fullLibraryCss = injectFullLibraryCss();

  protected readonly markdown = computed(() => this.content.value());
  protected readonly hasMarkdown = computed(() => this.content.status() === 'resolved');

  protected readonly tokenSections = TOKEN_SECTIONS;

  protected readonly fullCssSections = computed<FullCssSection[]>(() => {
    const css = this.fullLibraryCss();
    return [
      {
        id: 'all-styles',
        title: 'All Styles — Full CSS',
        markdown: css ? '```css\n' + css + '\n```' : undefined,
      },
    ];
  });
}
