import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { highlightCode } from '../code-highlight';

const COPIED_LABEL_DURATION_MS = 1500;

type CodeTab = 'html' | 'ts';

/**
 * Paired HTML/TypeScript code display with a tab switcher, for docs where seeing the
 * template alone isn't enough to know how to wire a working example up. The `ts` input
 * must be a complete, paste-and-run file — full imports, `@Component` decorator, class
 * body — not just the fragment referenced by `html`.
 */
@Component({
  selector: 'app-code-tabs',
  templateUrl: './code-tabs.html',
  styleUrl: './code-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeTabsComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = input.required<string>();
  readonly ts = input.required<string>();

  protected readonly activeTab = signal<CodeTab>('html');
  protected readonly copyLabel = signal('Copy');

  private readonly highlightedHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(highlightCode(this.html(), 'html')),
  );
  private readonly highlightedTs = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(highlightCode(this.ts(), 'typescript')),
  );

  protected readonly activeHighlighted = computed(() =>
    this.activeTab() === 'html' ? this.highlightedHtml() : this.highlightedTs(),
  );

  protected selectTab(tab: CodeTab): void {
    this.activeTab.set(tab);
    this.copyLabel.set('Copy');
  }

  protected onCopy(): void {
    const source = this.activeTab() === 'html' ? this.html() : this.ts();

    navigator.clipboard.writeText(source).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy'), COPIED_LABEL_DURATION_MS);
    });
  }
}
