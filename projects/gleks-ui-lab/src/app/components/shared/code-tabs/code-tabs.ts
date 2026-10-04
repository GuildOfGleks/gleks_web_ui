import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollComponent } from '@guildofgleks/ui';
import { highlightCode } from '../code-highlight';

const COPIED_LABEL_DURATION_MS = 1500;

type CodeTab = 'html' | 'ts';

const LANGUAGE: Record<CodeTab, string> = {
  html: 'html',
  ts: 'typescript',
};

/**
 * An example's two files — template and component — behind a tab strip.
 *
 * **HTML and TS, and the TS is TypeScript only** (`docs/lab-component-pages.md`, D1/D2): the
 * component uses `templateUrl`, so the markup is in the HTML tab and never repeated inside the TS
 * one. An example carries no stylesheet — its preview layout is `<app-demo>`'s — so there is no
 * CSS tab, and `generate-example-sources.mjs` refuses an `example.css`.
 */
@Component({
  selector: 'app-code-tabs',
  imports: [ScrollComponent],
  templateUrl: './code-tabs.html',
  styleUrl: './code-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeTabsComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = input.required<string>();
  readonly ts = input.required<string>();

  protected readonly tabs: readonly { readonly id: CodeTab; readonly label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'ts', label: 'TS' },
  ];

  /** Markup first: it is the part a reader compares against what is rendered above it. */
  protected readonly activeTab = signal<CodeTab>('html');
  protected readonly copyLabel = signal('Copy');

  private readonly sources = computed<Record<CodeTab, string>>(() => ({
    html: this.html(),
    ts: this.ts(),
  }));

  protected readonly activeSource = computed(() => this.sources()[this.activeTab()]);

  /** Drives both the placeholder and hiding Copy, so they can never disagree. */
  protected readonly isEmpty = computed(() => this.activeSource().trim() === '');

  /**
   * What an empty tab says. An example with no template documents configuration rather than
   * markup, and should say so rather than look broken.
   */
  protected readonly emptyMessage = computed(() => {
    switch (this.activeTab()) {
      case 'html':
        return 'This example has no template — it is configuration, not markup.';
      default:
        return 'Nothing to show for this file.';
    }
  });

  protected readonly activeHighlighted = computed(() => {
    const tab = this.activeTab();
    return this.sanitizer.bypassSecurityTrustHtml(
      highlightCode(this.sources()[tab], LANGUAGE[tab]),
    );
  });

  protected selectTab(tab: CodeTab): void {
    this.activeTab.set(tab);
    this.copyLabel.set('Copy');
  }

  protected onCopy(): void {
    navigator.clipboard.writeText(this.activeSource()).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy'), COPIED_LABEL_DURATION_MS);
    });
  }
}
