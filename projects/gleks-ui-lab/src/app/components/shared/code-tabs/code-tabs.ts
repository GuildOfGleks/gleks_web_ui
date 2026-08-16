import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollComponent } from '@guildofgleks/ui';
import { highlightCode } from '../code-highlight';

const COPIED_LABEL_DURATION_MS = 1500;

type CodeTab = 'html' | 'ts' | 'css';

const LANGUAGE: Record<CodeTab, string> = {
  html: 'html',
  ts: 'typescript',
  css: 'css',
};

/**
 * The three files of one example — template, component, stylesheet — behind a tab strip.
 *
 * The `ts` input must be a complete, paste-and-run file: full imports, `@Component` decorator,
 * class body, not just the fragment `html` references.
 *
 * **The strip is the same shape on every card, including for an example that needs no CSS.**
 * Hiding the tab in that case would be smaller, but then a missing tab is ambiguous — the reader
 * cannot tell "this example needs no styles" from "the styles exist and we did not show them",
 * and that second reading is the one that makes someone paste an example and wonder why it looks
 * wrong. An empty CSS tab says so in words instead, and the toolbar keeps its width as the reader
 * moves down the page.
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
  /**
   * The example's own stylesheet. Only what the example genuinely needs to look right when
   * pasted — not the lab's demo scaffolding (`.action-row`, the size grids), which is this
   * site's layout and not part of what is being documented.
   */
  readonly css = input<string>('');

  protected readonly tabs: readonly { readonly id: CodeTab; readonly label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'ts', label: 'TS' },
    { id: 'css', label: 'CSS' },
  ];

  /** Markup first: it is the part a reader compares against what is rendered above it. */
  protected readonly activeTab = signal<CodeTab>('html');
  protected readonly copyLabel = signal('Copy');

  private readonly sources = computed<Record<CodeTab, string>>(() => ({
    html: this.html(),
    ts: this.ts(),
    css: this.css(),
  }));

  protected readonly activeSource = computed(() => this.sources()[this.activeTab()]);

  /** Drives both the placeholder and hiding Copy, so they can never disagree. */
  protected readonly isEmpty = computed(() => this.activeSource().trim() === '');

  /**
   * What an empty tab says. Per tab, because the three empty cases mean different things: an
   * example with no stylesheet is ordinary, while an example with no template is one that
   * documents configuration rather than markup — and "no styles" printed over a missing template
   * would just read as a bug.
   */
  protected readonly emptyMessage = computed(() => {
    switch (this.activeTab()) {
      case 'css':
        return 'This example needs no styles of its own.';
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
