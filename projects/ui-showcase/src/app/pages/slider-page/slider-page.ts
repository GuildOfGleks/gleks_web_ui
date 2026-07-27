import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonComponent, SliderComponent } from '@gleks/ui';

@Component({
  selector: 'app-slider-page',
  imports: [ButtonComponent, SliderComponent],
  templateUrl: './slider-page.html',
  styleUrl: './slider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPage {
  protected readonly volume = signal(45);
  protected readonly brightness = signal(70);
  protected readonly precision = signal(0.45);

  protected readonly summary = computed(
    () =>
      `Volume is ${this.volume()}, brightness is ${this.brightness()}, and precision is ${this.precision()}.`,
  );

  protected readonly budget = signal(80);
  protected readonly budgetError = computed(() =>
    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',
  );

  protected reset(): void {
    this.volume.set(45);
    this.brightness.set(70);
    this.precision.set(0.45);
  }
}
