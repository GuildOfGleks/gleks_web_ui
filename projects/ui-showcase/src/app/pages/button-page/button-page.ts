import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogSize, GogVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-button-page',
  imports: [ButtonComponent],
  templateUrl: './button-page.html',
  styleUrl: './button-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly variants: GogVariant[] = ['primary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];
  protected readonly isLoading = signal(false);
  protected readonly lastClicked = signal('No button clicked yet.');

  protected onClick(variant: GogVariant, size: GogSize): void {
    this.lastClicked.set(`Clicked "${variant}" (${size})`);
  }

  protected simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 1500);
  }
}
