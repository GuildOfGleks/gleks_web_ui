import { Component, signal } from '@angular/core';
import { ChipComponent } from '@guildofgleks/ui';

interface Tag {
  id: string;
  label: string;
}

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    @for (tag of tags(); track tag.id) {
      <gog-chip [removable]="true" (gogRemove)="removeTag(tag.id)">{{ tag.label }}</gog-chip>
    }
  `,
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
