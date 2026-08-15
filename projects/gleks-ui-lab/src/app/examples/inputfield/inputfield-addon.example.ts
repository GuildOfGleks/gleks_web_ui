import { Component, signal } from '@angular/core';
import {
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  IconComponent,
  InputfieldComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    InputfieldComponent,
    GogInputAddonStartDirective,
    GogInputAddonEndDirective,
    IconComponent,
  ],
  template: `
    <gog-inputfield label="Amount" [(value)]="amount">
      <span gogInputAddonStart>$</span>
      <span gogInputAddonEnd>USD</span>
    </gog-inputfield>

    <gog-inputfield label="Search" [(value)]="search">
      <button type="button" gogInputAddonEnd aria-label="Clear search" (click)="clearSearch()">
        <gog-icon name="close" />
      </button>
    </gog-inputfield>
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
export class InputfieldAddonExample {
  protected readonly amount = signal('');
  protected readonly search = signal('');

  // A plain method on a real button — no callback threaded through the field.
  protected clearSearch(): void {
    this.search.set('');
  }
}
