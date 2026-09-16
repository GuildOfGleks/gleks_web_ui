import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  GogPanelHeaderDirective,
  PanelComponent,
  SliderComponent,
  type GogSliderRange,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-slider-page',
  imports: [
    ButtonComponent,
    GogPanelHeaderDirective,
    PanelComponent,
    SliderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './slider-page.html',
  styleUrl: './slider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPage {
  protected readonly volume = signal(45);
  protected readonly brightness = signal(70);
  protected readonly precision = signal(0.45);
  protected readonly hiddenValue = signal(60);
  protected readonly ariaOnlyValue = signal(50);
  protected readonly compactValue = signal(40);
  protected readonly orientationHorizontalValue = signal(30);
  protected readonly orientationVerticalValue = signal(65);
  protected readonly priceRange = signal<GogSliderRange>({ start: 20, end: 80 });
  protected readonly verticalRange = signal<GogSliderRange>({ start: 30, end: 70 });
  protected readonly floorPinnedRange = signal<GogSliderRange>({ start: 20, end: 80 });
  protected readonly ceilingPinnedRange = signal<GogSliderRange>({ start: 20, end: 80 });

  protected readonly summary = computed(
    () =>
      `Volume is ${this.volume()}, brightness is ${this.brightness()}, and precision is ${this.precision()}.`,
  );

  protected readonly budget = signal(80);
  protected readonly budgetError = computed(() =>
    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',
  );

  /** `errorDisplay="auto"`: timing follows the FormControl's own touched/invalid state. */
  protected readonly minimumControl = new FormControl<number>(10, {
    nonNullable: true,
    validators: Validators.min(50),
  });
  private readonly minimumValue = toSignal(this.minimumControl.valueChanges, {
    initialValue: this.minimumControl.value,
  });
  protected readonly minimumErrorMessage = computed(() => {
    this.minimumValue();
    return this.minimumControl.hasError('min') ? 'Must be at least 50.' : '';
  });

  protected reset(): void {
    this.volume.set(45);
    this.brightness.set(70);
    this.precision.set(0.45);
  }
}
