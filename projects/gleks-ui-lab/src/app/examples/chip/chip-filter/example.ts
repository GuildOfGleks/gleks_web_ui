import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipFilterExample {
  protected readonly topics = [
    { label: 'Accessibility', on: signal<boolean | null>(true) },
    { label: 'Theming', on: signal<boolean | null>(false) },
    { label: 'Forms', on: signal<boolean | null>(true) },
    { label: 'Tables', on: signal<boolean | null>(false) },
  ];
  protected readonly selectedTopics = computed(() =>
    this.topics.filter((topic) => topic.on()).map((topic) => topic.label),
  );
}
