import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollComponent } from '@guildofgleks/ui';
import { highlightCode } from '../code-highlight';
import { ExampleSource } from '../example-sources';
import { StackblitzService } from '../stackblitz';

const COPIED_LABEL_DURATION_MS = 1500;

type CodeTab = keyof ExampleSource;

/**
 * The three files of one example — `example.html`, `example.ts`, `example.css` — behind a tab
 * strip, with copy and "open on StackBlitz" beside it.
 *
 * **The tab strip is the same shape on every card.** An example always has all three files (see
 * `ExampleSource`), so a reader never has to work out whether a missing tab means the file is
 * empty or merely not shown, and the toolbar does not change width as they move down the page.
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
  private readonly stackblitz = inject(StackblitzService);

  readonly source = input.required<ExampleSource>();
  /** Names the StackBlitz project. Left unset, the service derives one from the current route. */
  readonly title = input<string | null>(null);

  protected readonly tabs: readonly { id: CodeTab; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'ts', label: 'TS' },
    { id: 'css', label: 'CSS' },
  ];

  /** Markup first: it is the part a reader compares against what they see rendered above. */
  protected readonly activeTab = signal<CodeTab>('html');
  protected readonly copyLabel = signal('Copy');

  /**
   * Whether the example can be booted as a project. The handful that document a
   * `provideGogConfig` call rather than a component cannot, and hide the button instead of
   * opening a project that fails to compile.
   */
  protected readonly canOpenInStackblitz = computed(() =>
    this.stackblitz.isRunnable(this.source()),
  );

  protected openInStackblitz(): void {
    this.stackblitz.open(this.source(), this.title());
  }

  private readonly language: Record<CodeTab, string> = {
    html: 'html',
    ts: 'typescript',
    css: 'css',
  };

  protected readonly activeHighlighted = computed(() => {
    const tab = this.activeTab();
    return this.sanitizer.bypassSecurityTrustHtml(
      highlightCode(this.source()[tab], this.language[tab]),
    );
  });

  protected selectTab(tab: CodeTab): void {
    this.activeTab.set(tab);
    this.copyLabel.set('Copy');
  }

  protected onCopy(): void {
    navigator.clipboard.writeText(this.source()[this.activeTab()]).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy'), COPIED_LABEL_DURATION_MS);
    });
  }
}
