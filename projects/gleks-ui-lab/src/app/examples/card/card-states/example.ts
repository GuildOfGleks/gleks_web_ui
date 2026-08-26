import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  GogCardHeaderDirective,
  GogCardLinkDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CardComponent,
    GogCardHeaderDirective,
    GogCardLinkDirective,
    RouterLink,
  ],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStatesExample {
  protected readonly loading = signal(true);
  protected readonly disabled = signal(true);

  protected toggleLoading(): void {
    this.loading.update((v) => !v);
  }

  protected toggleDisabled(): void {
    this.disabled.update((v) => !v);
  }
}
