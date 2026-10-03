import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonAriaStateExample {
  protected readonly pages = [1, 2, 3] as const;
  protected readonly mirrored = signal(false);
  protected readonly filtersOpen = signal(false);
  protected readonly current = signal<number>(1);

  protected toggleMirror(): void {
    this.mirrored.update((on) => !on);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }
}
