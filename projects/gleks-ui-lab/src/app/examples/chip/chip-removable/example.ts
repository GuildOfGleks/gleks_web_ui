import { Component, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

interface Tag {
  id: string;
  label: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ChipComponent],
})
export class ChipRemovableExample {
  protected readonly tags = signal<Tag[]>([
    { id: 'angular', label: 'Angular' },
    { id: 'typescript', label: 'TypeScript' },
  ]);

  protected removeTag(id: string): void {
    this.tags.update((current) => current.filter((tag) => tag.id !== id));
  }
}
