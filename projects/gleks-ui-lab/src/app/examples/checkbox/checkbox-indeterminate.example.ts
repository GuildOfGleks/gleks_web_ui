import { Component, computed, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

interface Subscription {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `
    <gog-checkbox
      label="Select all"
      [checked]="allChecked()"
      [indeterminate]="someChecked() && !allChecked()"
      (checkedChange)="setAll($event)"
    />

    @for (item of subscriptions(); track item.id) {
      <gog-checkbox
        [label]="item.label"
        [checked]="item.checked"
        (checkedChange)="setOne(item.id, $event)"
      />
    }
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
export class CheckboxIndeterminateExample {
  protected readonly subscriptions = signal<Subscription[]>([
    { id: 'news', label: 'Newsletter', checked: true },
    { id: 'offers', label: 'Special offers', checked: false },
  ]);
  protected readonly allChecked = computed(() =>
    this.subscriptions().every((item) => item.checked),
  );
  protected readonly someChecked = computed(() =>
    this.subscriptions().some((item) => item.checked),
  );

  protected setAll(checked: boolean): void {
    this.subscriptions.update((items) => items.map((item) => ({ ...item, checked })));
  }

  protected setOne(id: string, checked: boolean): void {
    this.subscriptions.update((items) =>
      items.map((item) => (item.id === id ? { ...item, checked } : item)),
    );
  }
}
