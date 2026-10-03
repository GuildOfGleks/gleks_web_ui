import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonAriaStateExample {
  protected readonly mirrored = signal(false);
  protected readonly filtersOpen = signal(false);

  protected toggleMirror(): void {
    this.mirrored.update((on) => !on);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }
}
