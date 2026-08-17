import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CheckboxComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
} from '@guildofgleks/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-collapsible-page',
  imports: [
    ButtonComponent,
    CheckboxComponent,
    CollapsibleComponent,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
    IconComponent,
    RouterLink,
  ],
  templateUrl: './collapsible-page.html',
  styleUrl: './collapsible-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsiblePage {
  // Overview
  protected readonly overviewOpen = signal(false);

  // States
  protected readonly closedByDefault = signal(false);
  protected readonly openByDefault = signal(true);
  protected readonly disabledOpen = signal(false);
  protected readonly focusOutOpen = signal(false);

  // Customization
  protected readonly combinedTriggerOpen = signal(false);
  protected readonly iconSwapOpen = signal(false);
  protected readonly richContentOpen = signal(false);

  // Tall content — the case `--gog-collapsible-max-height: 480px` used to clip silently.
  protected readonly tallOpen = signal(true);
  protected readonly cappedOpen = signal(true);
  protected readonly tallRows = signal(
    Array.from({ length: 24 }, (_, index) => `Region ${String(index + 1).padStart(2, '0')}`),
  );

  // Permissions / access control
  protected readonly hasBillingAccess = signal(false);
  protected readonly isAdmin = signal(false);
  protected readonly permissionsOpen = signal(true);

  // Controlled from outside
  protected readonly externalOpen = signal(false);

  // Independent FAQ list
  protected readonly faqItems = signal<FaqItem[]>([
    {
      id: 'billing',
      question: 'How is usage billed?',
      answer: 'Metered monthly, per active seat — see the Billing panel for the current period.',
      open: false,
    },
    {
      id: 'roles',
      question: 'Who can change roles?',
      answer: 'Only workspace admins can promote or demote another member.',
      open: false,
    },
    {
      id: 'export',
      question: 'Can I export my data?',
      answer: 'Yes, from Settings → Export — a full JSON dump is generated within a few minutes.',
      open: false,
    },
  ]);

  protected readonly permissionSummary = computed(() => {
    const parts: string[] = [];
    parts.push(this.hasBillingAccess() ? 'billing: yes' : 'billing: no');
    parts.push(this.isAdmin() ? 'admin: yes' : 'admin: no');
    return parts.join(' · ');
  });

  protected setFaqOpen(id: string, open: boolean): void {
    this.faqItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, open } : item)),
    );
  }
}
