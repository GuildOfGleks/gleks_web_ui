import { Component, computed, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

interface Subscription {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CheckboxComponent],
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
