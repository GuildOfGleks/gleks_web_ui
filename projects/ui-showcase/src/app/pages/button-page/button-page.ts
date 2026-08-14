import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogButtonDirective,
  GogSize,
  GogVariant,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-button-page',
  imports: [ButtonComponent, GogButtonDirective, IconComponent, RouterLink],
  templateUrl: './button-page.html',
  styleUrl: './button-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly isLoading = signal(false);
  protected readonly lastClicked = signal('No button clicked yet.');

  protected readonly loadingBySize: Record<GogSize, ReturnType<typeof signal<boolean>>> = {
    xsm: signal(false),
    sm: signal(false),
    md: signal(false),
    lg: signal(false),
    slg: signal(false),
  };

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
    const target = this.loadingBySize[size];
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
