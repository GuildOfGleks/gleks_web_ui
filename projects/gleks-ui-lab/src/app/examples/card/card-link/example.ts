import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  GogCardFooterDirective,
  GogCardHeaderDirective,
  GogCardLinkDirective,
  TagComponent,
} from '@guildofgleks/ui';

interface Person {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CardComponent,
    GogCardFooterDirective,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    RouterLink,
    TagComponent,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkExample {
  protected readonly people: readonly Person[] = [
    { id: 'ada', name: 'Ada Lovelace', role: 'Mathematician' },
    { id: 'alan', name: 'Alan Turing', role: 'Logician' },
  ];

  /** Proof the footer button is not swallowed by the card's stretched link. */
  protected readonly footerClicks = signal(0);

  protected shortlist(): void {
    this.footerClicks.update((n) => n + 1);
  }
}
