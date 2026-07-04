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

  protected readonly summary = computed(
    () => `Volume is ${this.volume()} and brightness is ${this.brightness()}.`,
  );

  protected reset(): void {
    this.volume.set(45);
    this.brightness.set(70);
  }
}
