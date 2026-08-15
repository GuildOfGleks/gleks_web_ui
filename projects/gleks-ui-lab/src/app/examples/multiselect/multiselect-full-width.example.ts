import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect label="Features" [options]="features" [(value)]="fullWidthFeatures" />
    <gog-multiselect label="Tags" [options]="tags" [(value)]="fullWidthTags" [fullWidth]="false" />
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
export class MultiselectFullWidthExample {
  protected readonly fullWidthFeatures = signal<(string | number)[]>([]);
  protected readonly fullWidthTags = signal<(string | number)[]>(['bug']);
  protected readonly features: GogDropdownOption[] = [
    { id: 'sso', name: 'SSO' },
    { id: 'audit', name: 'Audit log' },
    { id: 'api', name: 'API access' },
  ];
  protected readonly tags: GogDropdownOption[] = [
    { id: 'bug', name: 'Bug' },
    { id: 'feature', name: 'Feature' },
    { id: 'chore', name: 'Chore' },
  ];
}
