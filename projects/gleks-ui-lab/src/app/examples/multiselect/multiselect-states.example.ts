import { Component, computed, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect label="Disabled" [options]="features" [value]="['toast']" [disabled]="true" />

    <gog-multiselect
      label="Permissions (one disabled)"
      [options]="permissionsWithDisabled"
      [(value)]="permissions"
    />

    <gog-multiselect
      label="Required tags"
      placeholder="Pick at least one..."
      [options]="permissionsWithDisabled"
      [errorMessage]="requiredError()"
      [(value)]="requiredValue"
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
export class MultiselectStatesExample {
  protected readonly features: GogDropdownOption[] = [
    { id: 'sso', name: 'SSO' },
    { id: 'audit', name: 'Audit log' },
    { id: 'api', name: 'API access' },
  ];
  protected readonly permissionsWithDisabled: GogDropdownOption[] = [
    { id: 'read', name: 'Read' },
    { id: 'write', name: 'Write' },
    { id: 'admin', name: 'Admin (contact owner)', disabled: true },
  ];
  protected readonly permissions = signal<(string | number)[]>(['read']);
  protected readonly requiredValue = signal<(string | number)[]>([]);
  protected readonly requiredError = computed(() =>
    this.requiredValue().length === 0 ? 'Pick at least one option.' : '',
  );
}
