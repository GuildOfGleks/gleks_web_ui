import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@gleks/ui';

interface AccordionDemoItem extends GogAccordionItem {
  summary: string;
  notes: string[];
}

@Component({
  selector: 'app-accordion-page',
  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],
  templateUrl: './accordion-page.html',
  styleUrl: './accordion-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPage {
  protected readonly items: AccordionDemoItem[] = [
    {
      id: 'signals',
      title: 'Signals',
      summary: 'Use signals for local state and computed values for derived data.',
      notes: ['Keep mutations explicit.', 'Favor pure derivations.', 'Bind directly from the template.'],
    },
    {
      id: 'routing',
      title: 'Routing',
      summary: 'Lazy-load showcase pages so the app stays responsive.',
      notes: ['Keep routes small.', 'Expose each component as its own page.', 'Use the shell nav to jump around.'],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      summary: 'Treat keyboard support and semantics as part of the default UX.',
      notes: ['Preserve focus order.', 'Use real buttons and labels.', 'Keep content readable by screen readers.'],
    },
  ];

  protected readonly multi = signal(false);

  protected toggleMulti(): void {
    this.multi.update((current) => !current);
  }
}
