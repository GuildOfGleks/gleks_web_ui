import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect label="Features" [options]="features" [(value)]="fullWidthFeatures" />
    <gog-multiselect label="Tags" [options]="tags" [(value)]="fullWidthTags" [fullWidth]="false" />
  `,
})
export class MultiselectFullWidthExample {
  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);
  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);
  protected readonly features: GogDropdownOption[] = [/* ... */];
  protected readonly tags: GogDropdownOption[] = [/* ... */];
}
