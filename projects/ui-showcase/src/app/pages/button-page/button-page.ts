import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogSize, GogVariant, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-button-page',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './button-page.html',
  styleUrl: './button-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['sm', 'md', 'lg'];

  protected readonly isLoading = signal(false);
  protected readonly lastClicked = signal('No button clicked yet.');

  protected readonly loadingSm = signal(false);
  protected readonly loadingMd = signal(false);
  protected readonly loadingLg = signal(false);

  protected readonly clickCount = signal(0);
  protected readonly formResult = signal('Neither button pressed yet.');

  protected onClick(variant: GogVariant, size: GogSize): void {
    this.lastClicked.set(`Clicked "${variant}" (${size})`);
  }

  protected simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 1500);
  }

  protected simulateLoadingFor(size: GogSize): void {
    const target = size === 'sm' ? this.loadingSm : size === 'md' ? this.loadingMd : this.loadingLg;
    target.set(true);
    setTimeout(() => target.set(false), 1500);
  }

  protected onSpamClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  protected onFormSubmit(event: Event): void {
    event.preventDefault();
    this.formResult.set('Submitted via type="submit".');
  }

  protected onFormReset(): void {
    this.formResult.set('Reset via type="reset".');
  }
}
