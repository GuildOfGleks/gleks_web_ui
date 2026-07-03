import {
  ChangeDetectionStrategy,
  effect,
  Component,
  contentChild,
  Directive,
  inject,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { GogSize } from '../../shared/types';

export interface GogAccordionItem {
  id: string | number;
  title: string;
  [key: string]: unknown;
}

@Directive({
  selector: '[gogAccordionContent]',
})
export class GogAccordionContentDirective {
  readonly templateRef = inject<TemplateRef<{ $implicit: GogAccordionItem }>>(TemplateRef);
}


@Component({
  selector: 'gog-accordion',
  imports: [NgTemplateOutlet],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-accordion-host',
  },
})
export class AccordionComponent {
  readonly items = input<GogAccordionItem[]>([]);
  readonly size = input<GogSize>('lg');
  readonly expandFirst = input(false);
  readonly multi = input(false);
  readonly loading = input(false);

  readonly contentTpl = contentChild(GogAccordionContentDirective);

  protected readonly openIds = signal<Set<string | number>>(new Set());

  constructor() {
    effect(() => {
      const items = this.items();

      if (!this.expandFirst() || items.length === 0 || this.openIds().size > 0) {
        return;
      }

      this.openIds.set(new Set([items[0].id]));
    });
  }

  protected isOpen(id: string | number): boolean {
    return this.openIds().has(id);
  }

  protected toggle(id: string | number): void {
    const current = this.openIds();
    const next = new Set(current);

    if (next.has(id)) {
      next.delete(id);
    } else {
      if (!this.multi()) next.clear();
      next.add(id);
    }

    this.openIds.set(next);
  }
}
