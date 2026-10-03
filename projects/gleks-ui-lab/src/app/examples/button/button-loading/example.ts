import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLoadingExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly saving = signal(false);
  protected readonly loading = signal<GogSize | null>(null);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }

  protected load(size: GogSize): void {
    this.loading.set(size);
    setTimeout(() => this.loading.set(null), 1500);
  }
}
