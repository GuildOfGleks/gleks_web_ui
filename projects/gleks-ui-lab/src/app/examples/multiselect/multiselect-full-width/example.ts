import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [MultiselectComponent],
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
