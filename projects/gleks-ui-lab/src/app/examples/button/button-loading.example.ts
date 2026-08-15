import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

const REQUEST_MS = 1500;

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <gog-button variant="primary" [loading]="saving()" (gogClick)="save()">Save</gog-button>
    <p>{{ saving() ? 'Saving…' : 'Idle.' }}</p>
  `,
})
export class ButtonLoadingExample {
  protected readonly saving = signal(false);

  protected save(): void {
    // Stands in for the real request. `loading` blocks activation through `aria-disabled`
    // rather than the native `disabled` attribute, so the button keeps focus while it runs.
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), REQUEST_MS);
  }
}
