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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class MultiselectControlsExample {
  protected readonly countries: GogDropdownOption[] = [
    { id: 'de', name: 'Germany' },
    { id: 'nl', name: 'Netherlands' },
    { id: 'pt', name: 'Portugal' },
    { id: 'ua', name: 'Ukraine' },
  ];
  protected readonly topControlsValue = signal<(string | number)[]>([]);
  protected readonly bottomControlsValue = signal<(string | number)[]>([]);
}
