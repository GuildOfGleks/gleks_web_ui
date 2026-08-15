import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
} from '@guildofgleks/ui';

import { MarkdownComponent } from '../../shared/markdown/markdown';
import { FAQ_ITEMS, FAQ_SECTIONS } from './faq-data';

const STRUCTURED_DATA_ID = 'faq-structured-data';

/**
 * Reduces an answer's markdown to the first paragraph as plain text, for the `FAQPage`
 * structured data below. Deliberately not the whole answer: several of them carry tables and
 * fenced code, which `acceptedAnswer.text` is not meant to hold, and the first paragraph is
 * already the answer — the rest is elaboration.
 */
function firstParagraph(markdown: string): string {
  return markdown
    .split('\n\n')[0]
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-faq-page',
  imports: [
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
    MarkdownComponent,
  ],
  templateUrl: './faq-page.html',
  styleUrl: './faq-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPage {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly sections = FAQ_SECTIONS;

  /**
   * Which questions are expanded. Every answer is in the DOM either way — `gogCollapsibleContent`
   * hides a closed panel with CSS and `inert` rather than removing it — so this is a display
   * concern only, and the page a crawler receives contains all 25 answers in full.
   */
  private readonly openIds = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly allExpanded = computed(() => this.openIds().size === FAQ_ITEMS.length);

  constructor() {
    this.publishStructuredData();

    // A link into a specific question (`/general/faq#is-this-ready-for-production`) has to open
    // it, not just scroll to a collapsed header — otherwise the answer someone was sent to is
    // the one thing they cannot see.
    //
    // Subscribed rather than read once from the snapshot, because the first answer links to
    // another question on this same page: that navigation changes only the fragment, so the
    // component is never recreated and a one-shot read would miss it.
    this.route.fragment
      .pipe(takeUntilDestroyed())
      .subscribe((fragment) => this.revealFragment(fragment));
  }

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  protected setOpen(id: string, open: boolean): void {
    this.openIds.update((ids) => {
      const next = new Set(ids);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(): void {
    const expand = !this.allExpanded();
    this.openIds.set(expand ? new Set(FAQ_ITEMS.map((faqItem) => faqItem.id)) : new Set());
  }

  private revealFragment(fragment: string | null): void {
    if (!fragment || !this.isBrowser) return;
    if (!FAQ_ITEMS.some((faqItem) => faqItem.id === fragment)) return;

    this.setOpen(fragment, true);
    // Deferred a tick: on first load the heading has not been rendered yet, and on a later
    // fragment change the panel is still opening — scrolling to a collapsed one lands the
    // reader in the wrong place either way.
    setTimeout(() =>
      this.document
        .getElementById(fragment)
        ?.scrollIntoView({ behavior: 'instant', block: 'start' }),
    );
  }

  /**
   * `FAQPage` structured data, which is what lets a search result show the questions themselves
   * rather than a link to a page that has some. Generated from the same source the page renders,
   * so the two cannot disagree — a hand-maintained copy is the version that goes stale and then
   * earns a Search Console warning for describing content that is not on the page.
   *
   * Written straight into `<head>` rather than into `index.html`, because it belongs to this page
   * only. It runs during server rendering too, which is the point: the crawler that reads the
   * markup is the one that needs it.
   */
  private publishStructuredData(): void {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((faqItem) => ({
        '@type': 'Question',
        name: faqItem.question,
        acceptedAnswer: { '@type': 'Answer', text: firstParagraph(faqItem.answer) },
      })),
    };

    const script = this.document.createElement('script');
    script.id = STRUCTURED_DATA_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);

    this.destroyRef.onDestroy(() => {
      this.document.getElementById(STRUCTURED_DATA_ID)?.remove();
    });
  }
}
