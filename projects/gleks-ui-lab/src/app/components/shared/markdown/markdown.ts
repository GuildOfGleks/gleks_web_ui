import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdown } from './markdown-renderer';

const COPIED_LABEL_DURATION_MS = 1500;

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.html',
  styleUrl: './markdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Markdown is rendered to raw HTML via [innerHTML], which Angular's emulated
  // encapsulation attribute selectors don't reach — this content needs global rules.
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly markdown = input.required<string>();

  // Markdown source is authored by us (static .md docs, not user input), so the
  // rendered HTML is trusted — bypass sanitization to keep elements like the
  // <button> in the code-block toolbar, which Angular's sanitizer strips by default.
  protected readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(this.markdown())),
  );

  protected onClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest('.code-block__copy');
    if (!(button instanceof HTMLButtonElement)) return;

    const code = button.closest('.code-block')?.querySelector('code');
    if (!code?.textContent) return;

    navigator.clipboard.writeText(code.textContent).then(() => {
      const originalLabel = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => (button.textContent = originalLabel), COPIED_LABEL_DURATION_MS);
    });
  }
}
