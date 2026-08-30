import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  ViewContainerRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollComponent } from '@guildofgleks/ui';
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
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  readonly markdown = input.required<string>();

  // Markdown source is authored by us (static .md docs, not user input), so the
  // rendered HTML is trusted — bypass sanitization to keep elements like the
  // <button> in the code-block toolbar, which Angular's sanitizer strips by default.
  protected readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(this.markdown())),
  );

  // The `<pre>` a fenced code block renders into is part of the raw [innerHTML] string
  // (see markdown-renderer.ts), so it's never compiled by Angular — a literal `<gog-scroll>`
  // tag inside that string would just sit there as an unknown, inert element. Getting the
  // real component (not a CSS lookalike) means mounting it by hand after each render: wrap
  // every `<pre>` the browser just parsed in a dynamically created ScrollComponent, with the
  // `<pre>` itself passed through as its projected content.
  private scrollRefs: ComponentRef<ScrollComponent>[] = [];

  constructor() {
    afterRenderEffect(() => {
      this.html(); // track: re-run whenever the rendered HTML changes
      this.mountCodeBlockScrolls();
    });
  }

  private mountCodeBlockScrolls(): void {
    for (const ref of this.scrollRefs) ref.destroy();
    this.scrollRefs = [];

    const pres = this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.code-block > pre');
    for (const pre of Array.from(pres)) {
      const parent = pre.parentElement;
      if (!parent) continue;

      // Captured *before* createComponent, which immediately detaches `pre` from here to
      // re-parent it into the new component's projected content.
      const nextSibling = pre.nextSibling;

      const ref = this.viewContainerRef.createComponent(ScrollComponent, {
        environmentInjector: this.environmentInjector,
        projectableNodes: [[pre]],
      });
      ref.setInput('size', 'thin');
      ref.setInput('axis', 'both');
      ref.setInput('ariaLabel', 'Code sample');

      const hostEl = ref.location.nativeElement as HTMLElement;
      hostEl.classList.add('code-block__scroll');
      parent.insertBefore(hostEl, nextSibling);

      this.scrollRefs.push(ref);
    }
  }

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
