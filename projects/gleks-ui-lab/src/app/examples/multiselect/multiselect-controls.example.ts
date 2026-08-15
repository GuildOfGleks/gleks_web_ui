import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect
      label="Top (default)"
      [options]="countries"
      [showControls]="true"
      [(value)]="topControlsValue"
    />

    <gog-multiselect
      label="Bottom"
      [options]="countries"
      [showControls]="true"
      controlsPosition="bottom"
      [(value)]="bottomControlsValue"
    />
  `,
})
export class MultiselectControlsExample {
  protected readonly countries: GogDropdownOption[] = [/* ... */];
  protected readonly topControlsValue = signal<(string | number)[]>([]);
  protected readonly bottomControlsValue = signal<(string | number)[]>([]);
}
