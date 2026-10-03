import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxSelectAllExample {
  protected readonly topics = [
    { id: 'releases', name: 'Releases' },
    { id: 'security', name: 'Security advisories' },
    { id: 'digest', name: 'Weekly digest' },
  ];
  protected readonly selected = signal<readonly string[]>(['security']);

  protected readonly allSelected = computed(() => this.selected().length === this.topics.length);
  /** Some but not all — never both with checked. */
  protected readonly someSelected = computed(
    () => this.selected().length > 0 && !this.allSelected(),
  );

  protected toggle(id: string, checked: boolean): void {
    this.selected.update((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id),
    );
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.topics.map((topic) => topic.id) : []);
  }
}
