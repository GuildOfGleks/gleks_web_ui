import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollComponent } from '@guildofgleks/ui';
import { highlightCode } from '../code-highlight';
import { StackblitzService } from '../stackblitz';

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
  imports: [ScrollComponent],
  templateUrl: './code-tabs.html',
  styleUrl: './code-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeTabsComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly stackblitz = inject(StackblitzService);

  /**
   * Optional. An example that lives in its own file (`<app-example>`) has no separate markup to
   * show — the file *is* the source — so it renders as a single code block with no tab strip.
   * The pages still passing both are the ones where the snippet is deliberately different from
   * what is rendered; see `docs/lab-examples-refactor.md`.
   */
  readonly html = input<string | null>(null);
  readonly ts = input.required<string>();
  /** Names the StackBlitz project. Left unset, the service derives one from the current route. */
  readonly title = input<string | null>(null);

  private readonly requestedTab = signal<CodeTab>('html');
  protected readonly copyLabel = signal('Copy');

  /** With no `html`, the TS source is the only thing there is to show. */
  protected readonly hasTabs = computed(() => this.html() !== null);
  protected readonly activeTab = computed<CodeTab>(() =>
    this.hasTabs() ? this.requestedTab() : 'ts',
  );

  /**
   * The `ts` input is contractually a complete file, so almost every example can be booted — the
   * handful that document a `provideGogConfig` call rather than a component cannot, and hide the
   * button instead of opening a project that fails to compile.
   */
  protected readonly canOpenInStackblitz = computed(() => this.stackblitz.isRunnable(this.ts()));

  protected openInStackblitz(): void {
    this.stackblitz.open(this.ts(), this.title());
  }

  private readonly highlightedHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(highlightCode(this.html() ?? '', 'html')),
  );
  private readonly highlightedTs = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(highlightCode(this.ts(), 'typescript')),
  );

  protected readonly activeHighlighted = computed(() =>
    this.activeTab() === 'html' ? this.highlightedHtml() : this.highlightedTs(),
  );

  protected selectTab(tab: CodeTab): void {
    this.requestedTab.set(tab);
    this.copyLabel.set('Copy');
  }

  protected onCopy(): void {
    const source = (this.activeTab() === 'html' ? this.html() : this.ts()) ?? '';

    navigator.clipboard.writeText(source).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy'), COPIED_LABEL_DURATION_MS);
    });
  }
}
