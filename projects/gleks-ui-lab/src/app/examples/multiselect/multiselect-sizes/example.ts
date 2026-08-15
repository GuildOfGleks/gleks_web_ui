import { Component, signal } from '@angular/core';
import { GogDropdownOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [MultiselectComponent],
})
export class MultiselectSizesExample {
  protected readonly features: GogDropdownOption[] = [
    { id: 'sso', name: 'SSO' },
    { id: 'audit', name: 'Audit log' },
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);
}
