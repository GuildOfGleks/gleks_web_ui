import {
  ChangeDetectionStrategy,
  effect,
  Component,
  contentChild,
  ElementRef,
  Directive,
  inject,
  input,
  output,
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

export interface GogAccordionHeaderContext {
  $implicit: GogAccordionItem;
  open: boolean;
}

export interface GogAccordionToggleEvent {
  item: GogAccordionItem;
  open: boolean;
}

export interface GogAccordionChevronContext {
  $implicit: GogAccordionItem;
  open: boolean;
}

@Directive({
  selector: '[gogAccordionContent]',
})
export class GogAccordionContentDirective {
  readonly templateRef = inject<TemplateRef<{ $implicit: GogAccordionItem }>>(TemplateRef);
}

@Directive({
  selector: '[gogAccordionHeader]',
})
export class GogAccordionHeaderDirective {
  readonly templateRef = inject<TemplateRef<GogAccordionHeaderContext>>(TemplateRef);
}

@Directive({
  selector: '[gogAccordionChevron]',
})
export class GogAccordionChevronDirective {
  readonly templateRef = inject<TemplateRef<GogAccordionChevronContext>>(TemplateRef);
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
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly items = input<GogAccordionItem[]>([]);
  readonly size = input<GogSize>('lg');
  readonly expandFirst = input(false);
  readonly multi = input(false);
  readonly loading = input(false);
  readonly showChevron = input(true);

  readonly gogToggle = output<GogAccordionToggleEvent>();

  readonly headerTpl = contentChild(GogAccordionHeaderDirective);
  readonly chevronTpl = contentChild(GogAccordionChevronDirective);
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

  protected toggle(item: GogAccordionItem): void {
   const id = item.id;
   const current = this.openIds();
   const next = new Set(current);

   if (next.has(id)) {
     next.delete(id);
    } else {
      if (!this.multi()) next.clear();
      next.add(id);
    }

    this.openIds.set(next);
    this.gogToggle.emit({ item, open: next.has(id) });
  }

  protected onHeaderKeydown(event: KeyboardEvent, index: number): void {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }

    const host = this.host.nativeElement as HTMLElement;
    const headers = Array.from(host.querySelectorAll('.gog-accordion__header')) as HTMLButtonElement[];

    if (headers.length === 0) {
      return;
    }

    event.preventDefault();

    const lastIndex = headers.length - 1;
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? lastIndex
          : event.key === 'ArrowDown'
            ? (index + 1) % headers.length
            : (index - 1 + headers.length) % headers.length;

    headers[nextIndex]?.focus();
  }
}
